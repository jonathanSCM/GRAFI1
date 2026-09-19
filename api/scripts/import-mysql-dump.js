// Importa un dump de MySQL/MariaDB (mysqldump) a la base Postgres del esquema Prisma.
// Uso: node scripts/import-mysql-dump.js <dump.sql[.gz]> [--apply]
// Sin --apply hace un dry-run: parsea, valida columnas y muestra conteos.
// La base destino debe tener el esquema creado (prisma migrate deploy) y estar vacia.
require('dotenv').config();
const fs = require('fs');
const zlib = require('zlib');
const { Client } = require('pg');

const file = process.argv[2];
const apply = process.argv.includes('--apply');
if (!file) { console.error('Falta el archivo de dump'); process.exit(1); }

let sql = fs.readFileSync(file);
if (file.endsWith('.gz')) sql = zlib.gunzipSync(sql);
sql = sql.toString('utf8');

// Orden de columnas por tabla, desde los CREATE TABLE del dump.
const columns = {};
for (const m of sql.matchAll(/CREATE TABLE `([^`]+)` \(\n([\s\S]*?)\n\) ENGINE/g)) {
  columns[m[1]] = m[2].split('\n').map((l) => l.match(/^\s+`([^`]+)`/)).filter(Boolean).map((x) => x[1]);
}

// Parser de tuplas de "INSERT INTO `t` VALUES (...),(...);"
function parseValues(text, start) {
  const rows = [];
  let i = start;
  const n = text.length;
  while (i < n) {
    while (text[i] === ' ' || text[i] === '\n' || text[i] === ',') i++;
    if (text[i] === ';') return { rows, end: i + 1 };
    if (text[i] !== '(') throw new Error('Se esperaba ( en ' + i);
    i++;
    const row = [];
    for (;;) {
      while (text[i] === ' ') i++;
      if (text[i] === "'") {
        let s = ''; i++;
        for (;;) {
          const c = text[i];
          if (c === '\') {
            const e = text[i + 1];
            s += { n: '\n', r: '\r', t: '\t', '0': '\0', b: '\b', Z: '\x1a' }[e] ?? e;
            i += 2;
          } else if (c === "'") {
            if (text[i + 1] === "'") { s += "'"; i += 2; } else { i++; break; }
          } else { s += c; i++; }
        }
        row.push(s);
      } else {
        let j = i;
        while (text[j] !== ',' && text[j] !== ')') j++;
        const tok = text.slice(i, j).trim();
        row.push(tok === 'NULL' ? null : tok);
        i = j;
      }
      if (text[i] === ',') { i++; continue; }
      if (text[i] === ')') { i++; break; }
      throw new Error('Token inesperado en ' + i + ': ' + text.slice(i, i + 20));
    }
    rows.push(row);
  }
  throw new Error('INSERT sin terminar');
}

const data = {};
for (const m of sql.matchAll(/^INSERT INTO `([^`]+)` VALUES\s*/gm)) {
  const { rows } = parseValues(sql, m.index + m[0].length);
  (data[m[1]] ||= []).push(...rows);
}
delete data._prisma_migrations;

(async () => {
  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  await pg.connect();
  const { rows: cols } = await pg.query(
    `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public'`,
  );
  const target = {};
  for (const c of cols) (target[c.table_name] ||= {})[c.column_name] = c.data_type;

  const problems = [];
  const order = ['plans', 'companies', 'users', 'profiles', 'links', 'social_links', 'cards', 'qr_codes', 'catalog_items', '_CatalogItemAssignments', 'leads', 'analytics_events', 'subscriptions', 'payments'];
  for (const t of Object.keys(data)) if (!order.includes(t)) problems.push('Tabla sin orden definido: ' + t);

  const plan = [];
  for (const t of order) {
    const rows = data[t] || [];
    if (!rows.length) continue;
    if (!target[t]) { problems.push('No existe la tabla destino ' + t); continue; }
    const src = columns[t];
    const keep = src.map((c, idx) => ({ c, idx })).filter(({ c }) => {
      if (target[t][c]) return true;
      problems.push(`Columna ${t}.${c} no existe en Postgres (se omite; valores no nulos: ${rows.filter((r) => r[src.indexOf(c)] !== null).length})`);
      return false;
    });
    plan.push({ t, rows, keep });
  }

  const conv = (type, v) => {
    if (v === null) return null;
    if (type === 'boolean') return v === '1';
    return v;
  };

  console.log('Filas parseadas:');
  for (const p of plan) console.log(`  ${p.t}: ${p.rows.length}`);
  if (problems.length) { console.log('\nAvisos:'); problems.forEach((p) => console.log('  - ' + p)); }
  if (!apply) { console.log('\nDry-run: no se escribio nada. Usa --apply.'); await pg.end(); return; }

  try {
    await pg.query('BEGIN');
    for (const p of plan) {
      const names = p.keep.map((k) => `"${k.c}"`).join(',');
      for (const r of p.rows) {
        const vals = p.keep.map((k) => conv(target[p.t][k.c], r[k.idx]));
        const ph = vals.map((_, i) => `$${i + 1}`).join(',');
        await pg.query(`INSERT INTO "${p.t}" (${names}) VALUES (${ph})`, vals);
      }
    }
    await pg.query('COMMIT');
  } catch (e) {
    await pg.query('ROLLBACK');
    console.error('Error, se hizo ROLLBACK:', e.message);
    process.exit(1);
  }
  console.log('\nVerificacion (tabla: dump -> postgres):');
  for (const p of plan) {
    const { rows } = await pg.query(`SELECT count(*)::int AS n FROM "${p.t}"`);
    console.log(`  ${p.t}: ${p.rows.length} -> ${rows[0].n} ${rows[0].n === p.rows.length ? 'OK' : 'DIFERENTE'}`);
  }
  await pg.end();
})();
