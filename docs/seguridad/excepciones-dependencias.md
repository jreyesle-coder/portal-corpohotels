# Excepciones del filtro de dependencias

El pipeline (`npx audit-ci --config audit-ci.jsonc`) se detiene ante cualquier vulnerabilidad alta o crítica en las dependencias. Una excepción solo se admite cuando no existe versión corregida y la vulnerabilidad no es explotable en el portal. Cada excepción se revisa en la fecha indicada y se retira apenas haya corrección.

| Aviso | Paquete | Severidad | Por qué no es explotable en el portal | Vía en el árbol | Registrada | Revisar |
| --- | --- | --- | --- | --- | --- | --- |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | braces ≤ 3.0.3 (no hay versión corregida publicada) | Alta | Denegación de servicio al expandir patrones de archivos con llaves anidadas. En el portal esos patrones salen del código y de la configuración (vigilancia de archivos de Sass y búsqueda de módulos de Payload en el arranque); ningún dato del visitante llega a `braces` | `@payloadcms/next` → sass → chokidar → braces; `@payloadcms/storage-azure` → find-node-modules → findup-sync → micromatch → braces | 2026-10-04 | 2026-11-04 o cuando se publique braces 3.0.4 |

## Correcciones aplicadas por `overrides` (package.json)

| Paquete | Versión forzada | Avisos corregidos |
| --- | --- | --- |
| undici (la copia que usa Payload) | 7.30.0 | GHSA-rfgv-xxqx-mfg5, GHSA-w293-vg96-wgc3 (altas) y siete moderadas o bajas |
| nodemailer | 10.0.14 | GHSA-v53p-9fqp-m79j, GHSA-prgh-xp8r-p3m5 (altas) y tres moderadas |
| dompurify | 3.4.16 | Aviso bajo del panel del CMS |

Las versiones forzadas se retiran cuando Payload publique una versión que ya las traiga.
