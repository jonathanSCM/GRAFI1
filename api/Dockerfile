FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# prisma.config.ts lee DATABASE_URL; generate no se conecta, solo necesita que exista.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts /app/package.json ./
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 3001
VOLUME ["/app/uploads"]
# Aplica migraciones pendientes y arranca la API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
