# Novedades

Ambigüedades y hallazgos detectados durante el desarrollo. No se resuelven a criterio del desarrollo: cada una indica a quién se consulta y antes de qué sprint. Complementa la tabla "Riesgos y novedades a confirmar" de [requerimientos.md](requerimientos.md).

| # | Sprint | Novedad | Estado actual en el código | Consultar a | Antes de |
| --- | --- | --- | --- | --- | --- |
| N-01 | S0 | Faltan los SVG oficiales del kit de marca (icono azul y blanco, logo de Gobierno azul y blanco) | Marcadores de posición en `public/brand/`; ver `public/brand/LEEME.md`. Al copiarlos, ejecutar `npm run iconos` | TIC / Comunicaciones | S2 |
| N-02 | S0 | Versión mayor de PostgreSQL Flexible Server que entregará el proveedor | Docker Compose usa `postgres:17` | Proveedor | S1 |
| N-03 | S0 | Matomo requiere MySQL o MariaDB, no PostgreSQL. En Azure implica un Azure Database for MySQL Flexible Server, que no está en la lista del proceso CORPHOTEL-DAF-CM-2026-0009 | Local: `mariadb:11` en Docker Compose | Proveedor / DAF | S6 |
| N-04 | S0 | ~~El correo institucional de contacto no aparece en el portal actual~~ **Resuelta en S2:** el portal actual lo publica protegido: `info@corphotels.gob.do` | En «Datos institucionales» del CMS | Comunicaciones (confirmar) | — |
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
| N-15 | S2 | Coordenadas exactas de la sede para el mapa de Contactos (Bloque C, Oficinas Gubernamentales Juan Bosch) | Aproximadas (18.4769, −69.8960); se corrigen en «Datos institucionales» del CMS | Comunicaciones / Servicios Generales | S9 |
| N-16 | S2 | La Política de privacidad heredada es genérica: no menciona la Ley 172-13, el aviso de cookies, las estadísticas de Matomo ni el mapa de OpenStreetMap | Texto del portal actual cargado sin cambios | Jurídica | S6 |
| N-17 | S2 | Errores heredados del portal actual: los valores de «¿Quiénes somos?» citan a la «CGR» (texto copiado de la Contraloría); faltas de tildes y redacción en Preguntas frecuentes y Servicios (A2 2.01.c, lenguaje simple) | Contenido cargado tal cual para que lo revise cada dueño; se incluye en el informe de S5 | Dueños de cada sección | S5 |
| N-18 | S2 | Mientras se construye S4, «Transparencia» enlaza al portal de transparencia actual y al SAIP | Página provisional con contenido, no «en mantenimiento» (A2 4.01.h) | OAI | S4 |
| N-19 | S2 | Los banners del portal actual tienen el texto dentro de la imagen; se describe en el texto alternativo, pero la A2 7.01 recomienda texto real | Banners cargados con su texto en `alt` | Comunicaciones | S7 |

## Notas técnicas

- **404 dentro de una página (Next 16).** `notFound()` llamado dentro de una página responde con estado 404, pero el HTML lo dibuja el navegador. Las rutas inexistentes salen renderizadas en servidor gracias a `src/app/global-not-found.tsx`, y desde S2 el `proxy` verifica en PostgreSQL si una noticia, un servicio o una página de «Sobre nosotros» existe antes de mostrarla (caché de 30 s).
- **Contenido inicial.** `npm run sembrar` carga en el CMS el contenido extraído del portal actual (`semillas/portal-actual.json`): 9 páginas, 4 servicios, 6 noticias, 10 preguntas frecuentes, 3 banners, 4 documentos y los datos institucionales. La migración completa es S5.
- **Catálogo de componentes.** `src/app/(sitio)/componentes/page.dev.tsx` solo se compila en desarrollo, o con `INCLUIR_CATALOGO=1` para las pruebas automáticas.
- **Dependencias.** `npm audit` reporta 5 vulnerabilidades altas en dependencias de desarrollo (cadena de `braces` vía ESLint). Se tratan en S7 con el análisis de dependencias del pipeline.
- **Contenedor del portal sin panel.** El contenedor `portal` de Docker Compose corre como la app pública (`PANEL_HABILITADO=0`). El panel del CMS se prueba con `npm run dev`, porque el simulador de Entra entrega direcciones `localhost` que no existen dentro de la red de Docker.
- **Azurite.** Se arranca con `--skipApiVersionCheck`: el SDK de Azure usa versiones de API más nuevas que las que reconoce Azurite.
