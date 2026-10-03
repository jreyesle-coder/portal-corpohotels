# Imagen única del portal: la misma en local (docker compose) y en Azure App Service.
# Node.js LTS; salida "standalone" de Next.js; usuario sin privilegios.

FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS compilacion
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS ejecucion
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S portal && adduser -S portal -G portal
COPY --from=compilacion --chown=portal:portal /app/.next/standalone ./
COPY --from=compilacion --chown=portal:portal /app/.next/static ./.next/static
COPY --from=compilacion --chown=portal:portal /app/public ./public
USER portal
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/salud || exit 1
CMD ["node", "server.js"]
