# Novedades

Ambigüedades y hallazgos detectados durante el desarrollo. No se resuelven a criterio del desarrollo: cada una indica a quién se consulta y antes de qué sprint. Complementa la tabla "Riesgos y novedades a confirmar" de [requerimientos.md](requerimientos.md).

| # | Sprint | Novedad | Estado actual en el código | Consultar a | Antes de |
| --- | --- | --- | --- | --- | --- |
| N-01 | S0 | Faltan los SVG oficiales del kit de marca (icono azul y blanco, logo de Gobierno azul y blanco) | Marcadores de posición en `public/brand/`; ver `public/brand/LEEME.md`. Al copiarlos, ejecutar `npm run iconos` | TIC / Comunicaciones | S2 |
| N-02 | S0 | Versión mayor de PostgreSQL Flexible Server que entregará el proveedor | Docker Compose usa `postgres:17` | Proveedor | S1 |
| N-03 | S0 | Matomo requiere MySQL o MariaDB, no PostgreSQL. En Azure implica un Azure Database for MySQL Flexible Server, que no está en la lista del proceso CORPHOTEL-DAF-CM-2026-0009 | Local: `mariadb:11` en Docker Compose | Proveedor / DAF | S6 |
| N-04 | S0 | El correo institucional de contacto no aparece en el portal actual (pie, A2 3.02.f) | El pie solo muestra teléfono y dirección; `organismo.correo` en `src/contenido/sitio.ts` | Comunicaciones | S2 |
| N-05 | S0 | Logos oficiales aprobados para los banners de enlaces de interés (A2 4.01.c.ii.a); lista de Ventanillas e Instituciones relacionadas | Se muestran siglas. Ventanillas: VUI, VUC, VUCERD, Formalízate. Instituciones: Presidencia y MITUR | OGTIC / Comunicaciones | S2 |
| N-06 | S0 | El portal actual enlaza dos canales de YouTube distintos | Se omite YouTube; quedan Facebook, Instagram y X | Comunicaciones | S2 |
| N-07 | S0 | Sellos NORTIC que aplican al portal nuevo (A2 3.02.f) | Lista vacía en `sellosNortic`; la sección no se muestra vacía (4.01.h) | OGTIC | S9 |
| N-08 | S0 | Ubicación de la herramienta de tamaño de texto y contraste (A2 7.01.v): la norma no la ubica y la cabecera "solo debe contener" sus elementos | Botón flotante abajo a la derecha que abre un panel no modal | OGTIC | S7 |
| N-09 | S0 | Encabezado de contactos del pie: la norma dice "Contactos" en el texto y "Contáctanos" en las figuras 3.10–3.13 | "Contáctanos", igual que las figuras y el sdd-lib | OGTIC | S2 |
| N-10 | S0 | Color del identificador y del pie: el sdd-lib usa `#003876`; el documento fija `#0F539C` como primario | Identificador y pie en `#003876` (SDD), componentes en `#0F539C` | OGTIC | S2 |
| N-11 | S1 | Reclamo que prueba el doble factor en Entra ID: el token v2.0 puede no traer `amr`; el método previsto es el contexto de autenticación `c1` de acceso condicional (`acrs`) | `OIDC_VERIFICACION_MFA` admite `amr` (simulador) y `acrs:c1` (Entra real); se confirma en la primera prueba con una cuenta institucional | Administrador de Entra ID | S1 (prueba real) |
| N-12 | S1 | Licencia Entra ID P1 para acceso condicional (requisito del MFA obligatorio y de la directiva del CMS) | Documentado en `docs/entra-id.md` | TIC / DAF | S1 (prueba real) |
| N-13 | S1 | Equivalente de "ocultar escritorio" (A2 5.02.a): el panel está en `/gestion` (no la ruta predeterminada) y la app pública no lo sirve (`PANEL_HABILITADO=0`) | Riesgo 7 del documento: proponer a OGTIC | OGTIC | S8 |
| N-14 | S1 | `sharp` (procesamiento de imágenes) incluye binarios de libvips bajo LGPL-3.0; `busboy` y `streamsearch` no declaran licencia en su `package.json` (su repositorio indica MIT) | Listados en `LICENCIAS-TERCEROS.md` | Jurídica | S9 |

## Notas técnicas

- **404 dentro de una página (Next 16).** `notFound()` llamado dentro de una página responde con estado 404, pero el HTML lo dibuja el navegador. Las rutas inexistentes sí salen renderizadas en servidor gracias a `src/app/global-not-found.tsx`. En S2, cuando una noticia o un servicio no exista, se resolverá en `proxy` (reescribir a una ruta 404) para mantener el 404 renderizado en servidor.
- **Catálogo de componentes.** `src/app/(sitio)/componentes/page.dev.tsx` solo se compila en desarrollo, o con `INCLUIR_CATALOGO=1` para las pruebas automáticas.
- **Dependencias.** `npm audit` reporta 5 vulnerabilidades altas en dependencias de desarrollo (cadena de `braces` vía ESLint). Se tratan en S7 con el análisis de dependencias del pipeline.
- **Contenedor del portal sin panel.** El contenedor `portal` de Docker Compose corre como la app pública (`PANEL_HABILITADO=0`). El panel del CMS se prueba con `npm run dev`, porque el simulador de Entra entrega direcciones `localhost` que no existen dentro de la red de Docker.
- **Azurite.** Se arranca con `--skipApiVersionCheck`: el SDK de Azure usa versiones de API más nuevas que las que reconoce Azurite.
