# Portal CORPHOTELS

Portal institucional de la Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS), conforme a la NORTIC A2:2023.

- Requerimientos y plan de sprints: [docs/requerimientos.md](docs/requerimientos.md)
- Requisitos de salida a producción: [docs/salida-a-produccion.md](docs/salida-a-produccion.md)
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
| `npm run test:e2e` | Pruebas de S0 a S7 y del diseño contra la compilación de producción (requiere Docker Compose y `npm run sembrar`) |
| `npm run licencias` | Regenera `LICENCIAS-TERCEROS.md` (A2 5.02.a.i) |
| `npm run sembrar` | Carga el contenido inicial del portal en el CMS (idempotente) |
| `npm run fichas-pendientes` | Lista los servicios publicados sin ficha A5 completa; falla si hay alguno (paso obligatorio antes de producción) |
| `npm run transparencia-pendientes` | Lista las secciones de transparencia sin contenido; falla si hay alguna (paso obligatorio antes de producción) |
| `npm run limpiar-pruebas` | Borra del CMS el contenido creado por las pruebas (se ejecuta al terminar `test:e2e`) |

## Gestor de contenidos (Payload CMS)

- Panel: `/gestion` (con `npm run dev`, http://localhost:3004/gestion). Solo se entra con Entra ID y doble factor; en local, el simulador muestra un formulario donde se escriben el usuario y sus reclamos, por ejemplo:
  `{"oid":"u1","email":"editor@corphotels.gob.do","name":"Editor","roles":["Editor"],"amr":["pwd","mfa"]}`
- Roles (roles de aplicación en Entra): Editor, Publicador, OAI, Administrador, Auditor. Ver `src/cms/acceso.ts`.
- Colecciones: noticias, páginas (con borradores y aprobación), categorías, etiquetas, menús, imágenes, documentos, usuarios y bitácora (append-only, protegida también en PostgreSQL).
- El esquema cambia solo por migraciones: `npm run migracion:crear -- <nombre>` y `npm run migrar`. En producción se aplican al arrancar.
- Tras cambiar colecciones: `npm run generar` (tipos e import map del panel).

## Formularios y casos (S3)

- Formularios por pasos: contacto (`/contactos`), quejas y sugerencias (`/contactos/sugerencias`) y solicitud de servicio (`/servicios/<servicio>/solicitud`, si la ficha lo permite). Definiciones en `src/formularios/definiciones.ts`.
- Cada envío crea un caso `CPH-<año>-<consecutivo>` con los datos personales cifrados (AES-256-GCM, `CLAVE_CIFRADO_DATOS`) y envía correo al ciudadano y al buzón de atención (en local, bandeja de Mailpit: http://localhost:8025).
- Los casos y la encuesta de satisfacción se consultan en el panel, grupo «Atención ciudadana».

## Transparencia (S4)

- `/transparencia` con las 19 secciones de la A2 4.03 (Resolución DIGEIG 002-2021): menú vertical expandible a la izquierda en escritorio y cinco grupos más Contactos en móvil (A2 4.04). La estructura está en `src/contenido/transparencia.ts`; no se edita en el CMS porque la norma fija orden y nombres.
- La OAI (rol OAI) carga los documentos en el panel, grupo «Archivos» › Documentos, con área «Transparencia», sección, año y periodo. Las secciones de publicación periódica se muestran por año, el más reciente primero.
- Los textos de cada sección (datos del RAI, miembros de la CEP, presentación…) se editan en el grupo «Transparencia» › Textos de transparencia.

## Diseño de la portada

- Disposición tomada de hacienda.gob.do (pedido de TIC): cabecera azul (opción B de A2 3.02.a), contenido de hasta 1320 px y franjas de color de borde a borde.
- Carrusel principal: Portada › Carrusel principal en el CMS (noticias o avisos con fechas de vigencia). Si no hay diapositivas, muestra las últimas noticias con foto. El avance automático se apaga en Portada › Ajustes de la portada (novedad N-34).
- Franjas: Transparencia (accesos y últimos documentos), banners informativos, Servicios y Publicaciones, e instituciones relacionadas.
- «Arrendatarios» va al final del menú principal (`/arrendatarios`, novedad N-35).

## Migración del portal anterior (S5)

1. `npm run migracion:rastrear`: recorre el sitio público de los dos Joomla y deja el inventario en `migracion/datos/inventario.json` (el HTML descargado queda en `migracion/cache/`).
2. `npm run migracion:importar`: carga documentos, textos de transparencia, noticias e imágenes en el CMS y genera la tabla de redirecciones 301. Se puede repetir: lo ya migrado no se duplica.
3. `BASE_VERIFICACION=http://localhost:3100 npm run migracion:verificar`: prueba cada URL indexada del portal anterior y escribe `docs/migracion/verificacion-urls.csv`; falla si alguna queda sin resolver.
4. `npm run migracion:informe`: escribe `docs/migracion/informe.md` (para la revisión de cada dueño) y `docs/migracion/equivalencias.csv` (ID anterior → URL nueva).

Las equivalencias del menú anterior con la estructura nueva están en `scripts/migracion/mapas.ts`. El proxy aplica las redirecciones (`src/migracion/redireccion.ts`).

## Buscador, SEO y estadísticas (S6)

- Buscador en `/buscar`: búsqueda de texto completo de PostgreSQL en español y sin tildes (`src/busqueda/buscar.ts`, vista `busqueda_indice`). El CMS refresca el índice al guardar; tras una carga masiva lo refrescan `sembrar` y `migracion:importar`.
- Cada página tiene título «Página | CORPHOTELS | Fomento hotelero y turístico», meta descripción propia y URL canónica (el proxy la calcula). NoIndex y NoFollow se marcan por página en la pestaña «Buscadores (SEO)» del CMS.
- `/mapa-del-sitio`, `/sitemap.xml`, `/robots.txt` y marcado Schema.org (organización, noticias, servicios y rastro de navegación).
- Estadísticas: Matomo solo mide si la persona acepta en el aviso de cookies, sin cookies y sin terceros: el navegador habla con `/estadisticas/…` y el portal reenvía a Matomo. Instalación local: asistente en http://localhost:8080 (usuario y clave en `.env`), luego en el contenedor `config/config.ini.php` › `[General]` › `proxy_client_headers[] = "HTTP_X_FORWARDED_FOR"`, y la meta «Envío de formulario» (evento de categoría «Formulario»). Informe mensual: `docs/estadisticas/plantilla-informe-cigetic.md`.

## Seguridad y calidad (S7)

- Cabeceras de seguridad en toda respuesta y CSP con nonce por solicitud en las páginas (`src/seguridad/cabeceras.ts`, `src/proxy.ts`). Errores sin rastros técnicos (`error.tsx`, `global-error.tsx`).
- Pipeline `.github/workflows/calidad.yml`: ESLint sin advertencias, TypeScript, `audit-ci` (bloquea vulnerabilidades altas y críticas), Gitleaks, CodeQL y línea base de OWASP ZAP (bloquea alertas de riesgo alto). Dependabot semanal.
- Escaneo activo local: `docker run --rm -v <carpeta>:/zap/wrk ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://host.docker.internal:3100 -J informe.json -I` y luego `node scripts/seguridad/evaluar-zap.mjs informe.json`.
- Lighthouse: `BASE=http://localhost:3100 node scripts/calidad-lighthouse.mjs` (meta ≥ 90; resultados en `docs/calidad/lighthouse/`).
- Documentos: `docs/seguridad/sdlc.md` (ciclo de desarrollo seguro y OWASP Top 10), `docs/seguridad/excepciones-dependencias.md`, `docs/calidad/auditoria-wcag.md` (incluye la prueba con lector de pantalla).

## Configuración

Todas las variables se leen y validan en `src/config/index.ts`. En local vienen de `.env`; en Azure son App Settings, con los secretos como referencias de Key Vault (`@Microsoft.KeyVault(SecretUri=...)`). `/api/salud` es la sonda de salud de Docker y App Service.

## Estructura

```
src/app/(sitio)/        Portal público (layout, inicio, 404 de sección, catálogo de componentes)
src/app/global-not-found.tsx   404 de toda ruta inexistente
src/components/sdd/     Componentes del Sistema de Diseño Dominicano
src/contenido/sitio.ts  Respaldo de datos institucionales y menú (el portal los lee del CMS)
src/contenido/transparencia.ts  Estructura fija de la sección de transparencia (A2 4.03 y 4.04)
src/sitio/              Lectura del CMS para el portal público y plantilla de páginas
semillas/               Contenido inicial extraído del portal actual
src/config/             Capa única de configuración
src/cms/                Colecciones, roles, flujo editorial y bitácora del CMS
src/auth/               Inicio de sesión con Entra ID (OIDC) y sesión del CMS
src/migraciones/        Migraciones de la base de datos
src/proxy.ts            Bloquea panel y API de escritura en la app pública (PANEL_HABILITADO=0)
public/brand/           Activos de marca (marcadores de posición hasta recibir el kit)
```
