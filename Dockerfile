# syntax=docker/dockerfile:1

# --- Frontend (Vite) ---
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
# Same-origin /api behind Caddy
ENV VITE_API_URL=
RUN npm run build

# --- API build ---
FROM node:20-alpine AS server-build
WORKDIR /app/server
RUN apk add --no-cache openssl
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server ./
RUN npx prisma generate && npm run build

# --- API runtime ---
FROM node:20-alpine AS api
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV PORT=3001

# Keep layout so mediaDir ../../src/assets/mock from server/dist resolves
COPY --from=server-build /app/server/package.json /app/server/package-lock.json /app/server/
COPY --from=server-build /app/server/node_modules /app/server/node_modules
COPY --from=server-build /app/server/dist /app/server/dist
COPY --from=server-build /app/server/prisma /app/server/prisma
COPY src/assets/mock /app/src/assets/mock
COPY deploy/api-entrypoint.sh /app/server/entrypoint.sh
RUN sed -i 's/\r$//' /app/server/entrypoint.sh \
  && chmod +x /app/server/entrypoint.sh \
  && mkdir -p /app/server/uploads

WORKDIR /app/server
EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]

# --- Caddy with SPA baked in ---
FROM caddy:2-alpine AS caddy
COPY --from=frontend-build /app/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
