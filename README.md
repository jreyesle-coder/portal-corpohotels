# Portal CORPHOTELS

Portal institucional de la Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS), conforme a la NORTIC A2:2023.

- Requerimientos y plan de sprints: [docs/requerimientos.md](docs/requerimientos.md)
- Novedades por confirmar: [docs/novedades.md](docs/novedades.md)
- Registro del CMS en Entra ID: [docs/entra-id.md](docs/entra-id.md)
- Créditos de licencias de código abierto: [LICENCIAS-TERCEROS.md](LICENCIAS-TERCEROS.md)

## Requisitos

- Node.js 24 LTS
- Docker Desktop (para PostgreSQL, Azurite, Mailpit y Matomo)

## Desarrollo local

```bash
npm install
cp .env.example .env
docker compose up -d postgres azurite mailpit matomo entra-simulado
npm run migrar
npm run sembrar      # contenido inicial (solo la primera vez)
npm run dev
```

| Servicio | Dirección | Equivale en Azure a |
| --- | --- | --- |
| Portal | http://localhost:3000 | App Service |
| PostgreSQL | localhost:5432 | PostgreSQL Flexible Server |
| Azurite (Blob) | http://localhost:10000 | Blob Storage |
| Mailpit | http://localhost:8025 | Communication Services (Email) |
| Matomo | http://localhost:8080 | Matomo en App Service |
| Simulador de Entra ID | http://localhost:8090/entra | Entra ID corporativo |

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
| `npm run test:e2e` | Pruebas de S0, S1 y S2 contra la compilación de producción (requiere Docker Compose y `npm run sembrar`) |
| `npm run licencias` | Regenera `LICENCIAS-TERCEROS.md` (A2 5.02.a.i) |
| `npm run sembrar` | Carga el contenido inicial del portal en el CMS (idempotente) |
| `npm run limpiar-pruebas` | Borra del CMS el contenido creado por las pruebas (se ejecuta al terminar `test:e2e`) |

## Gestor de contenidos (Payload CMS)

- Panel: `/gestion` (con `npm run dev`, http://localhost:3004/gestion). Solo se entra con Entra ID y doble factor; en local, el simulador muestra un formulario donde se escriben el usuario y sus reclamos, por ejemplo:
  `{"oid":"u1","email":"editor@corphotels.gob.do","name":"Editor","roles":["Editor"],"amr":["pwd","mfa"]}`
- Roles (roles de aplicación en Entra): Editor, Publicador, OAI, Administrador, Auditor. Ver `src/cms/acceso.ts`.
- Colecciones: noticias, páginas (con borradores y aprobación), categorías, etiquetas, menús, imágenes, documentos, usuarios y bitácora (append-only, protegida también en PostgreSQL).
- El esquema cambia solo por migraciones: `npm run migracion:crear -- <nombre>` y `npm run migrar`. En producción se aplican al arrancar.
- Tras cambiar colecciones: `npm run generar` (tipos e import map del panel).

## Configuración

Todas las variables se leen y validan en `src/config/index.ts`. En local vienen de `.env`; en Azure son App Settings, con los secretos como referencias de Key Vault (`@Microsoft.KeyVault(SecretUri=...)`). `/api/salud` es la sonda de salud de Docker y App Service.

## Estructura

```
src/app/(sitio)/        Portal público (layout, inicio, 404 de sección, catálogo de componentes)
src/app/global-not-found.tsx   404 de toda ruta inexistente
src/components/sdd/     Componentes del Sistema de Diseño Dominicano
src/contenido/sitio.ts  Respaldo de datos institucionales y menú (el portal los lee del CMS)
src/sitio/              Lectura del CMS para el portal público y plantilla de páginas
semillas/               Contenido inicial extraído del portal actual
src/config/             Capa única de configuración
src/cms/                Colecciones, roles, flujo editorial y bitácora del CMS
src/auth/               Inicio de sesión con Entra ID (OIDC) y sesión del CMS
src/migraciones/        Migraciones de la base de datos
src/proxy.ts            Bloquea panel y API de escritura en la app pública (PANEL_HABILITADO=0)
public/brand/           Activos de marca (marcadores de posición hasta recibir el kit)
```
