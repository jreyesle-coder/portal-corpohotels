# Requisitos de salida a producción

Condiciones que deben cumplirse antes de desplegar en producción (S8) y del corte de DNS (S9). Las que tienen comprobación automática detienen el despliegue si fallan.

| # | Requisito | Comprobación | Origen |
| --- | --- | --- | --- |
| 1 | Todos los servicios publicados tienen la ficha A5 completa (15 campos) | `npm run fichas-pendientes` debe terminar sin pendientes; es un paso obligatorio del pipeline de despliegue a producción | A2 4.02.b, decisión de TIC (N-20) |
| 2 | En producción, `EXIGIR_FICHA_A5_COMPLETA=1`: el CMS no publica servicios incompletos y el portal no los muestra | App Setting del App Service de producción; prueba `tests/s3-exigencia-a5.spec.ts` | Decisión de TIC (N-20) |
| 3 | El botón «Solicitar en línea» de No Objeción apunta a la plataforma real en un dominio `.gob.do`, no al prototipo de Vercel | Revisión de la ficha en el CMS | N-22 |
| 4 | Escudo de CORPHOTELS en SVG oficial del kit de marca | Revisión de `public/brand/` | N-01 |
| 5 | Registro de Entra ID de producción con MFA por acceso condicional | Prueba de acceso con una cuenta real | N-11, N-12 |
| 6 | Contenido heredado revisado por cada dueño (errores de redacción, texto de la CGR, política de privacidad conforme a la Ley 172-13) | Informe de S5 firmado por los dueños | N-16, N-17 |
| 7 | Tiempos de respuesta de contacto y sugerencias confirmados | «Datos institucionales» del CMS | N-21 |
| 8 | Clave `CLAVE_CIFRADO_DATOS` en Key Vault con respaldo y procedimiento de rotación | Entregables del proveedor | N-24 |
| 9 | Ninguna sección de transparencia sin contenido: documentos, texto de la OAI o constancia de «no aplica» | `npm run transparencia-pendientes` debe terminar sin pendientes; paso obligatorio del pipeline de despliegue a producción | A2 4.01.h, 4.03; N-28 |
| 10 | Estructura de transparencia confirmada por la OAI con la resolución DIGEIG vigente y las inconsistencias de la A2 aclaradas | Acta o correo de la OAI | N-26, N-27 |
| 11 | Migración repetida en el corte con el contenido al día, hacia el Blob de Azure, y verificación de URL contra producción con 0 sin resolver | `npm run migracion:rastrear`, `migracion:importar` y `migracion:verificar` (con `BASE_VERIFICACION` de producción) | Requerimientos S5, S9 |
| 12 | Informe de migración revisado y firmado por la OAI (equivalencias a validar) y Comunicaciones (noticias y contenido sin lugar) | `docs/migracion/informe.md` | N-31, N-33, N-38 |
| 13 | Subdominios anteriores redirigidos al portal nuevo | DNS y Front Door | N-32 |
| 14 | Avance automático del carrusel confirmado o desactivado según la preauditoría | CMS: Portada › Ajustes de la portada | N-34 |

Esta lista se completa en cada sprint y se verifica en la preauditoría de S9 junto con la matriz de [requerimientos.md](requerimientos.md).
