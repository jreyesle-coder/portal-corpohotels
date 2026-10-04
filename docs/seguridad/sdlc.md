# Ciclo de desarrollo seguro del portal (SDLC)

**Normas:** NORTIC A8:2025, 3.04.4 (desarrollo seguro) y 3.03 (configuración segura); NORTIC A2:2023, 5.05 (seguridad del portal).
**Responsable:** División TIC. **Revisión del documento:** anual o cuando cambie el proceso.

## 1. Fases y controles

| Fase | Qué se hace | Control | Evidencia |
| --- | --- | --- | --- |
| Requerimientos | Cada requerimiento lleva su directriz de origen (A2, A5, A8) y el sprint que lo cumple | Matriz de [requerimientos.md](../requerimientos.md); ambigüedades a [novedades.md](../novedades.md), nunca resueltas a criterio del desarrollo | Matriz y novedades |
| Diseño | Amenazas consideradas por componente (sección 3) | Mínimo privilegio, separación portal público / panel privado, datos personales cifrados | Este documento, README |
| Codificación | TypeScript estricto, validación de toda entrada con zod, consultas parametrizadas, sin secretos en el código | ESLint sin advertencias, TypeScript sin errores | Pipeline «Código, tipos y dependencias» |
| Revisión de código | Todo cambio a `main` entra por solicitud de cambios (pull request) revisada por otra persona de TIC | Regla de protección de la rama `main` en GitHub (sección 4) | Historial de pull requests |
| Dependencias | Solo paquetes de npm con licencia compatible ([LICENCIAS-TERCEROS.md](../../LICENCIAS-TERCEROS.md)); actualización semanal | `audit-ci` bloquea vulnerabilidades altas y críticas; Dependabot propone las actualizaciones | Pipeline; [excepciones-dependencias.md](excepciones-dependencias.md) |
| Secretos | En `.env` local (fuera de git) y en Key Vault en Azure | Gitleaks revisa todo el historial en cada cambio | Pipeline «Secretos en el repositorio» |
| Análisis estático de seguridad | CodeQL con las consultas `security-extended` (OWASP Top 10 y CWE) | Alertas en GitHub › Security; la regla de la rama exige resolver las altas | Pipeline «CodeQL» |
| Pruebas | 220+ pruebas automáticas de extremo a extremo (Playwright) por sprint: funcionales, accesibilidad (axe), HTML válido, cabeceras, errores | Deben pasar todas antes de etiquetar un sprint | `npm run test:e2e` |
| Pruebas dinámicas | OWASP ZAP: línea base en cada cambio y escaneo activo antes de cada salida a producción | El pipeline se detiene ante cualquier alerta de riesgo alto | Pipeline «Prueba dinámica»; [zap/](zap/) |
| Prueba de penetración | Externa, antes de producción (A8 2.03.2) | Contratación por TIC (riesgo 14 de requerimientos) | Informe del proveedor |
| Despliegue | Imagen Docker única para QA y producción, desplegada por GitHub Actions con OIDC (S8) | Sin credenciales de larga duración en GitHub | Pipeline de despliegue (S8) |
| Operación | Bitácora de solo inserción, logs en Log Analytics, incidentes al CSIRT en 24 h (A8 5.03.1) | Procedimiento de incidentes | Plan de S8 y S9 |

## 2. OWASP Top 10 (2021) en el portal

| Riesgo | Cómo se mitiga | Dónde |
| --- | --- | --- |
| A01 Control de acceso roto | Roles de Entra con mínimo privilegio (editor, publicador, OAI, administrador, auditor); acceso verificado en el servidor por colección; el portal público no expone el panel ni la API de escritura | `src/cms/acceso.ts`, `src/proxy.ts` |
| A02 Fallas criptográficas | HTTPS con HSTS; datos personales de los casos cifrados con AES-256-GCM; clave en Key Vault | `src/seguridad/cabeceras.ts`, `src/formularios` |
| A03 Inyección | Consultas parametrizadas (Payload, `pg` con `$1`), sin SQL armado con texto del usuario; búsqueda con `websearch_to_tsquery`; HTML del CMS renderizado como componentes (sin `innerHTML`); JSON-LD escapado | `src/busqueda/buscar.ts`, `src/components/sdd/datos-estructurados.tsx` |
| A04 Diseño inseguro | Separación portal/panel, límite de envíos por IP, honeypot y validación por pasos en formularios | `src/formularios` |
| A05 Configuración insegura | CSP con nonce, cabeceras de seguridad, sin `X-Powered-By`, errores sin rastros técnicos, panel con `noindex` | `src/seguridad`, `src/app/(sitio)/error.tsx` |
| A06 Componentes vulnerables | `audit-ci` en el pipeline y Dependabot | `audit-ci.jsonc`, `.github/dependabot.yml` |
| A07 Fallas de autenticación | Entra ID con MFA obligatorio (A2 5.05.o); sesión con cookie `HttpOnly`, `Secure` y `SameSite`; sin contraseñas locales | `src/auth` |
| A08 Integridad de software y datos | Dependencias con `package-lock.json`; imagen Docker construida en el pipeline; migraciones versionadas | `Dockerfile`, `src/migraciones` |
| A09 Registro y monitoreo | Bitácora de solo inserción protegida en PostgreSQL; envío a Log Analytics en S8 | `src/cms/bitacora.ts` |
| A10 SSRF | El portal solo contacta servicios fijos de su configuración (base de datos, Blob, SMTP, Matomo); el reenvío de estadísticas no acepta destinos del usuario | `src/app/estadisticas` |

## 3. Amenazas principales y controles

- **Formularios ciudadanos** (contacto, sugerencias, solicitudes): CSRF por verificación de origen de las Server Actions, validación de longitud y formato en el servidor, límite por IP, honeypot, datos personales cifrados, sin inyección de encabezados de correo (destinatarios fijos).
- **Panel del CMS:** solo en la app privada; Entra ID con MFA; roles; bitácora.
- **Archivos subidos por el CMS:** tipos permitidos por lista y verificación de contenido; nombres normalizados; servidos con `nosniff`.
- **Estadísticas:** sin cookies, sin terceros, solo con consentimiento; el portal reenvía solo los parámetros del rastreador.

## 4. Configuración pendiente en GitHub (la hace el administrador del repositorio)

1. Abrir https://github.com/jreyesle-coder/portal-corpohotels/settings/rules y crear un conjunto de reglas para `main`:
   - «Require a pull request before merging» con al menos una aprobación.
   - «Require status checks to pass»: Código, tipos y dependencias; Secretos en el repositorio; CodeQL (OWASP Top 10); Prueba dinámica (OWASP ZAP).
   - «Require code scanning results»: CodeQL, con bloqueo en alertas de seguridad «High or higher».
2. Abrir https://github.com/jreyesle-coder/portal-corpohotels/settings/security_analysis y activar «Dependabot alerts», «Dependabot security updates» y «Secret scanning».

## 5. Verificación manual de accesibilidad

La guía de la prueba con lector de pantalla está en [../calidad/auditoria-wcag.md](../calidad/auditoria-wcag.md).
