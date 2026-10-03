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

## Notas técnicas

- **404 dentro de una página (Next 16).** `notFound()` llamado dentro de una página responde con estado 404, pero el HTML lo dibuja el navegador. Las rutas inexistentes sí salen renderizadas en servidor gracias a `src/app/global-not-found.tsx`. En S2, cuando una noticia o un servicio no exista, se resolverá en `proxy` (reescribir a una ruta 404) para mantener el 404 renderizado en servidor.
- **Catálogo de componentes.** `src/app/(sitio)/componentes/page.dev.tsx` solo se compila en desarrollo, o con `INCLUIR_CATALOGO=1` para las pruebas automáticas.
- **Dependencias.** `npm audit` reporta 5 vulnerabilidades altas en dependencias de desarrollo (cadena de `braces` vía ESLint). Se tratan en S7 con el análisis de dependencias del pipeline.
