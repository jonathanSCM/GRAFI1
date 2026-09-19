# Despliegue de Grafi en Coolify

Arquitectura: **un solo dominio** (`grafi.digital`) con tres recursos en Coolify.

| Recurso | Origen | Recibe |
|---|---|---|
| PostgreSQL | Base de datos de Coolify | (interno) |
| `grafi-api` | `api/Dockerfile` | `grafi.digital/api` y `grafi.digital/uploads` |
| `grafi-web` | `web/Dockerfile` | `grafi.digital` (todo lo demás) |

Traefik elige la regla más específica, así que `/api` y `/uploads` van a la API y el resto a la web.

## 1. PostgreSQL
1. En el proyecto: **+ New → Database → PostgreSQL 16**.
2. Anota el **Postgres URL (internal)**: es el `DATABASE_URL` de la API.
3. Para la importación de datos activa temporalmente **Make it publicly available** (puerto público) y pásame el **Postgres URL (public)**.
   Cuando termine la importación, **desactívalo**.

## 2. API (`grafi-api`)
1. **+ New → Application → Public Repository** → `https://github.com/jonathanSCM/GRAFI1` , rama `main`.
2. **Build Pack: Dockerfile**. **Base Directory: `/api`**. Dockerfile location: `/Dockerfile`.
3. **Ports Exposes: `3001`**.
4. **Domains:** `https://grafi.digital/api,https://grafi.digital/uploads`
5. En **Advanced**, **desactiva "Strip Prefixes"**. La API ya usa el prefijo `api` internamente; si Traefik lo quita, todo da 404.
6. **Environment Variables** (runtime):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | URL **interna** de Postgres del paso 1 |
   | `JWT_SECRET` | el mismo de `api/.env` actual (así las sesiones abiertas siguen válidas) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `PORT` | `3001` |
   | `PUBLIC_API_URL` | `https://grafi.digital` |
   | `PUBLIC_BASE_URL` | `https://grafi.digital` |
   | `WEB_ORIGIN` | `https://grafi.digital` |

7. **Persistent Storage → Add volume:** nombre `grafi-uploads`, **Destination Path `/app/uploads`**.
   Sin esto las imágenes y PDFs se pierden en cada redeploy.
8. **Deploy**. Al arrancar aplica solas las migraciones (`prisma migrate deploy`) y crea las tablas.

## 3. Web (`grafi-web`)
1. **+ New → Application →** mismo repo y rama `main`.
2. **Build Pack: Dockerfile**. **Base Directory: `/web`**.
3. **Ports Exposes: `3000`**.
4. **Domains:** `https://grafi.digital`
5. **Environment Variables:** `NEXT_PUBLIC_API_URL` = `https://grafi.digital/api`
   y **marca "Build Variable"**. Next.js la incrusta al compilar; si solo es variable de runtime, la web llamará a `localhost:3001`.
6. **Deploy**.

## 4. Importar los datos (lo hago yo)
Con la URL pública de la base ya creada la API (paso 2, así existen las tablas):

```bash
cd api
DATABASE_URL="<url pública>" node scripts/import-mysql-dump.js ../../u459467945_grafi.20260830162530.sql.gz          # dry-run
DATABASE_URL="<url pública>" node scripts/import-mysql-dump.js ../../u459467945_grafi.20260830162530.sql.gz --apply  # escribe
```
Imprime conteo de filas dump → Postgres por tabla. La base debe estar vacía.

## 5. Copiar los archivos subidos (`uploads`)
Los archivos están en `api/uploads` (unos 14 MB) y **no** están en git. Cópialos al volumen:

1. Conéctate por SSH al servidor de Coolify.
2. Ubica el volumen: `docker volume ls | grep uploads` y `docker volume inspect <nombre>` → campo `Mountpoint`.
3. Sube los archivos con `scp -r api/uploads/* usuario@servidor:/tmp/uploads/` y luego en el servidor:
   ```bash
   sudo cp -r /tmp/uploads/* <Mountpoint>/
   sudo chown -R 1000:1000 <Mountpoint>
   ```
   (`1000` es el usuario `node` del contenedor.)

## 6. DNS y corte
1. Baja el TTL del registro de `grafi.digital` a 300 s unas horas antes.
2. **Congela cambios en Hostinger** desde que sacas el dump: lo que se escriba allí después no estará en la nueva base. El dump actual es del 30/08/2026; si hubo altas o analíticas posteriores, saca un dump nuevo y repite el paso 4 sobre una base vacía.
3. Apunta el registro A de `grafi.digital` a la IP del servidor de Coolify. Let's Encrypt emite el certificado automáticamente cuando el DNS resuelve.

## 7. Verificación
- `https://grafi.digital/` carga la landing.
- Login con un usuario existente (admin) funciona.
- Un perfil público `https://grafi.digital/<slug>` carga con foto y logo (comprueba `/uploads/...`).
- Descarga de vCard y un QR se generan.
- Subir una foto nueva, redeploy de la API, y la foto sigue ahí (volumen OK).

## 8. Después
- Desactiva el acceso público de Postgres y, si la URL pública circuló por chat, cambia la contraseña de la base.
- Activa **backups** programados de Postgres en Coolify.
- Rollback: vuelve el registro A a Hostinger (por eso el TTL bajo). Hostinger sigue intacto hasta que lo apagues.

## Problemas típicos
| Síntoma | Causa |
|---|---|
| `/api/...` da 404 | "Strip Prefixes" sigue activo |
| La web llama a `localhost:3001` | `NEXT_PUBLIC_API_URL` no está como Build Variable; redeploy |
| Imágenes 404 tras redeploy | Falta el volumen en `/app/uploads` o permisos (paso 5) |
| API reinicia en bucle | `DATABASE_URL` incorrecta; mira los logs |
| Páginas de perfil fallan (SSR) | El contenedor web no llega a `https://grafi.digital/api`; revisa DNS/certificado |

## Desarrollo local
`docker compose up --build` levanta Postgres, API (3001) y web (3000).
