# Portal CORPHOTELS

Portal institucional de la Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS), conforme a la NORTIC A2:2023.

- Requerimientos y plan de sprints: [docs/requerimientos.md](docs/requerimientos.md)
- Novedades por confirmar: [docs/novedades.md](docs/novedades.md)

## Requisitos

- Node.js 24 LTS
- Docker Desktop (para PostgreSQL, Azurite, Mailpit y Matomo)

## Desarrollo local

```bash
npm install
cp .env.example .env
docker compose up -d postgres azurite mailpit matomo
npm run dev
```

| Servicio | Dirección | Equivale en Azure a |
| --- | --- | --- |
| Portal | http://localhost:3000 | App Service |
| PostgreSQL | localhost:5432 | PostgreSQL Flexible Server |
| Azurite (Blob) | http://localhost:10000 | Blob Storage |
| Mailpit | http://localhost:8025 | Communication Services (Email) |
| Matomo | http://localhost:8080 | Matomo en App Service |

Todo el entorno, incluida la imagen de producción del portal:

```bash
docker compose up --build
```

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. El catálogo de componentes está en `/componentes` |
| `npm run build` | Compilación de producción (`standalone`) |
| `npm run start:local` | Ejecuta la compilación standalone como en Docker |
| `npm run iconos` | Regenera favicon e íconos desde `public/brand/icono-azul.svg` |
| `npm run typecheck` / `npm run lint` | Tipos y lint |
| `npm run test:e2e` | Pruebas de S0 (medidas A2, accesibilidad axe, 404), contra la compilación de producción |

## Configuración

Todas las variables se leen y validan en `src/config/index.ts`. En local vienen de `.env`; en Azure son App Settings, con los secretos como referencias de Key Vault (`@Microsoft.KeyVault(SecretUri=...)`). `/api/salud` es la sonda de salud de Docker y App Service.

## Estructura

```
src/app/(sitio)/        Portal público (layout, inicio, 404 de sección, catálogo de componentes)
src/app/global-not-found.tsx   404 de toda ruta inexistente
src/components/sdd/     Componentes del Sistema de Diseño Dominicano
src/contenido/sitio.ts  Datos institucionales, menú y enlaces (pasan a Payload en S1)
src/config/             Capa única de configuración
public/brand/           Activos de marca (marcadores de posición hasta recibir el kit)
```
