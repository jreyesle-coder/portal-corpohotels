# Pruebas dinámicas con OWASP ZAP (S7)

**Fecha:** 2026-10-04. **Objetivo:** compilación de producción local (`npm run build`, `npm run start:local`), portal público (`PANEL_HABILITADO=0`). **Herramienta:** OWASP ZAP (imagen `ghcr.io/zaproxy/zaproxy:stable`).

| Prueba | Reglas | Riesgo alto | Riesgo medio | Informe |
| --- | --- | --- | --- | --- |
| Línea base (pasiva) | 61 superadas | 0 | 2 (falsos positivos) | [linea-base.html](linea-base.html) |
| Escaneo activo (inyección SQL, XSS, inclusión de archivos, comandos, CRLF, desbordamientos y otros) | 138 superadas | 0 | 2 (falsos positivos) | [escaneo-activo.html](escaneo-activo.html) |

## Alertas medias y bajas

| Alerta | Riesgo | Evaluación |
| --- | --- | --- |
| Absence of Anti-CSRF Tokens (10202) | Medio | Falso positivo. Los formularios usan Server Actions de Next.js, que rechazan envíos de otro origen; verificado en S3 (un origen falso recibe error) |
| Source Code Disclosure - Perl (10099) | Medio | Falso positivo: secuencias binarias dentro de PDF de transparencia |
| Cross-Origin-Embedder-Policy Header Missing (90004) | Bajo | No se envía para no bloquear el mapa de OpenStreetMap (novedad N-43); las demás cabeceras de aislamiento sí se envían |
| Content-Type Header Missing, Non-Storable Content, User Controllable HTML Element Attribute | Informativo | Sin riesgo: respuestas vacías de rutas inexistentes, caché y el parámetro de página del listado |

## Hallazgos corregidos durante las pruebas

| Hallazgo | Corrección | Prueba que lo cubre |
| --- | --- | --- |
| `/noticias?pagina=` con un número enorme causaba error 500 en la base de datos | Página acotada a 1000 | `tests/s7-calidad.spec.ts` › Robustez |
| Un byte nulo en la búsqueda o en una dirección del portal anterior causaba error 500 | Se eliminan caracteres de control antes de consultar | `tests/s7-calidad.spec.ts` › Robustez |
| Una dirección anterior con codificación inválida producía una excepción (respondía 404) | La normalización la descarta sin excepción | `tests/s7-calidad.spec.ts` › Robustez |

Para repetir: ver README › Seguridad y calidad. En el pipeline, la línea base corre en cada cambio y se detiene ante cualquier alerta de riesgo alto (`scripts/seguridad/evaluar-zap.mjs`).
