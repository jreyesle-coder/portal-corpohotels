# Informe de migración del portal anterior (S5)

Generado el 2026-10-04 con `npm run migracion:informe`. Contenido extraído del sitio público https://corphotels.gob.do el 2026-10-04. Cada dueño de sección revisa su parte y la firma antes de producción (requisito 6 de [salida-a-produccion.md](../salida-a-produccion.md)).

## Resumen

| Concepto | Cantidad |
| --- | --- |
| Páginas recorridas (portal y transparencia) | 3312 |
| Carpetas de documentos de transparencia (Phoca) | 2967 |
| Páginas de carpetas de transparencia | 2979 |
| Noticias de K2 | 284 |
| Documentos encontrados | 3514 |
| Documentos migrados en esta corrida | 0 |
| Documentos migrados en corridas anteriores | 3463 |
| Documentos no migrados | 47 |
| Textos de transparencia cargados | 0 (ya existían 9) |
| Noticias migradas | 0 (ya existían 173) |
| URL verificadas | 10691: 9378 con 301, 4 existen igual, 1309 justificadas, 0 sin resolver |

La tabla completa de equivalencias (ID anterior → URL nueva) está en [equivalencias.csv](equivalencias.csv) y la verificación URL por URL en [verificacion-urls.csv](verificacion-urls.csv).

## Para la OAI: equivalencias a validar

Secciones del portal de transparencia anterior que no tienen una subsección idéntica en la NORTIC A2 4.03. Se ubicaron en la más cercana; la OAI confirma o indica otra.

| Sección anterior | Ubicación nueva | Documentos | Motivo |
| --- | --- | --- | --- |
| /transparencia/index.php/finanzas/balance-general | /transparencia/finanzas/estados-financieros | 181 | El balance general es un estado financiero; la A2 4.03 no tiene subsección «Balance General». |
| /transparencia/index.php/compras-y-contrataciones-publicas/listado-de-compras-y-contrataciones-realizadas-y-aprobadas | /transparencia/compras/debajo-umbral | 150 | «Listado de compras y contrataciones realizadas y aprobadas» no tiene equivalente exacto en la A2 4.03; se ubicó en «Relación de Compras por debajo del Umbral» hasta que la OAI indique la subsección correcta. |
| /transparencia/index.php/comision-de-etica-publica-cep/comunicado-importante | /transparencia/cep | 1 | Comunicado sin subsección equivalente en la A2 4.03. |
| /transparencia/index.php/comision-de-etica-publica-cep/codigo-de-etica-institucional | /transparencia/cep/compromiso | 2 | El Código de Ética Institucional no tiene subsección propia en la A2 4.03; se ubicó junto al Compromiso Ético. |
| /transparencia/index.php/publicaciones-oficiales/certificacion-carta-compromiso | /transparencia/publicaciones | 1 | La Carta Compromiso al Ciudadano no tiene subsección propia en la A2 4.03; se publica en Publicaciones Oficiales. |
| /transparencia/index.php/compras-y-contrataciones-publicas/casos-de-urgencia | /transparencia/compras/casos-excepcion | 7 | Los casos de urgencia son casos de excepción (Ley 340-06, art. 6). |

## Contenido no migrado

### Documentos

| Identificador | Título | Motivo |
| --- | --- | --- |
| phoca:transparencia:65 | Estadisticas Gestion OAI Enero-Marzo-2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:127 | NORTIC-A3 sobre Datos Abiertos | El CMS lo rechazó: The following field is invalid: file |
| phoca:transparencia:129 | NORTIC-A5 sobre prestación y automatización de servicios públicos | El CMS lo rechazó: The following field is invalid: file |
| phoca:transparencia:229 | INFORMACION CLASIFICADA JUL2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:231 | Reporte Trimestral 311 Abril-Junio-2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:232 | Reporte Trimestral 311 Enero-Marzo 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:233 | Estado de Cuenta de Suplidores Jul2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:249 | Estado de Cuenta de Suplidores Ago2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:260 | INFORMACION CLASIFICADA AGO2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:268 | INFORMACION CLASIFICADA SEPTIEMBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:296 | Estado de Cuenta de Suplidores Sept2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:297 | ESTADISTISTICA INSTITUCIONAL ABRIL- JUNIO 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:299 | Reporte Trimestral 311 Julio-Septiembre 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:302 | INFORMACION CLASIFICADA OCTUBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:341 | PLAN OPERATIVO 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:343 | ESTADISTICA INSTITUCIONAL JUL-SEPT 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:356 | Estado de Cuenta de Suplidores Oct2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:418 | INFORMACION CLASIFICADA AGO2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:427 | Estado de Cuenta de Suplidores Noviembre2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:442 | INFORMACION CLASIFICADA NOVIEMBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:443 | EstadisticaTrimestral 311 OCTUBRE-DICIEMBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:445 | Estado de Cuenta a Suplidores Dic2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:453 | INFORMACION CLASIFICADA DICIEMBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:459 | ESTADISTICAS INSTITUCIONALES OCTUBRE-DICIEMBRE 2018 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:473 | INFORMACION CLASIFICADA ENERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:481 | ESTADO DE CUENTA A SUPLIDORES ENERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:485 | BENEFICIARIOS DE PROGRAMAS ASISTENCIALES ENERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:489 | RELACION DE INVENTARIO DE ALMACEN ENERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:524 | RELACION DE INVENTARIO DE ALMACEN FEBRERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:542 | BENEFICIARIOS DE PROGRAMAS ASISTENCIALES FEBRERO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:641 | RELACION DE INVENTARIO DE ALMACEN ABRIL 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:667 | RELACION ACTIVOS FIJO MAYO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:668 | RELACION DE INVENTARIO DE ALMACEN MAYO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:706 | RELACION DE ACTIVOS FIJOS JUNIO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:708 | RELACION DE INVENTARIO DE ALMACEN JUNIO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:729 | BENEFICIARIOS DE PROGRAMAS ASISTENCIALES JULIO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:736 | RELACION DE ACTIVOS FIJOS JULIO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:739 | RELACION DE INVENTARIO DE ALMACEN JULIO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:767 | RELACION DE INVENTARIO DE ALMACEN AGOSTO 2019 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2035 | PRESUPUESTO APROBADO 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2038 | INFORME DE CUENTAS POR PAGAR NOVIEMBRE 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2039 | INFORME DE CUENTAS POR PAGAR OCTUBRE 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2043 | NOMINA PERSONAL CONTRATADO OCTUBRE 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2044 | NOMINA PERSONAL DE SEGURIDAD OCTUBRE 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2203 | Reporte de evaluacion del Indice de transparencia Estandarizado emitido por la DIGEIG Diciembre 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2204 | Reporte de evaluacion del Indice de transparencia Estandarizado emitido por la DIGEIG Noviembre 2021 | El portal anterior no entrega el archivo (estado 404) |
| phoca:transparencia:2205 | Reporte de evaluacion del Indice de transparencia Estandarizado emitido por la DIGEIG Octubre 2021 | El portal anterior no entrega el archivo (estado 404) |

### Páginas sin equivalente

Páginas del portal anterior que no corresponden a ninguna sección del portal nuevo. Sus URL redirigen a la sección más cercana o quedan justificadas en la verificación.

| URL anterior | Título | Tipo |
| --- | --- | --- |
| /index.php/component/k2/itemlist/category/3-articulos | — | k2-item |
| /index.php/component/k2/itemlist/category/5-contacto | — | k2-lista |
| /index.php/component/k2/itemlist/category/www.corphotels | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/component/uniform/ | — | articulo |
| /index.php/component/uniform/form | — | articulo |
| /index.php/component/uniform/form?form_id=2&task=generateStylePages | — | otro |
| /index.php/contrasena-olvidada | — | articulo |
| /index.php/de-interes | De Interés | k2-item |
| /index.php/de-interes/itemlist/category/www.corphotels | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/error-404 | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/error-404/itemlist/category/www.corphotels | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/foro | — | articulo |
| /index.php/foro/busqueda | — | articulo |
| /index.php/foro/credits | — | articulo |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana | — | articulo |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana/2-que-te-parece-la-nueva-la-campana-de-ministerio-de-turismo-the-real-rd | — | articulo |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana/4-turismo-durante-la-pandemia | — | articulo |
| /index.php/foro/inicio | — | articulo |
| /index.php/foro/main-forum | — | articulo |
| /index.php/foro/statistics | — | articulo |
| /index.php/foro/suggestion-box | — | articulo |
| /index.php/foro/temas-recientes | — | articulo |
| /index.php/foro/turismo | — | articulo |
| /index.php/foro/welcome-mat | — | articulo |
| /index.php/foro/welcome-mat/1-welcome-to-kunena | — | articulo |
| /index.php/galeria-de-fotos | Galería de fotos | articulo |
| /index.php/galeria-de-fotos/category/10-dominicanalimpia | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/galeria-de-fotos/category/11-proyectoep | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/galeria-de-fotos/category/4-complejo-vacacional-ercilia-pepin | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/galeria-de-fotos/category/7-complejo-ecoturistico-la-mansion | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/galeria-de-fotos/category/8-inauguracion-casa-club-ercilia-pepin | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/galeria-de-fotos/category/9-compromiso-social | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/nombre-de-usuario | — | articulo |
| /index.php/POLITICAS DE PRIVACIDAD Estas Políticas (en adelante, las & | [Error 404] La página que estás buscando no existe o ha ocurrido un error inesperado. | k2-item |
| /index.php/propiedades-disponibles-de-inversion | Propiedades disponibles de inversión | k2-item |
| /index.php/propiedades/propiedades-disponibles-de-inversion | Propiedades disponibles de inversión | k2-item |
| /index.php/registro | — | articulo |

### URL que no se redirigen (justificadas)

| Justificación | URL |
| --- | --- |
| Subdominio anterior (ch.corphotels.gob.do): su redirección se configura en el DNS y Front Door en el corte (S9, novedad N-32). | 249 |
| Recurso técnico de Joomla (scripts, estilos e iconos); no es contenido. | 221 |
| Recurso técnico de la plantilla o del sistema Joomla; no es contenido. | 184 |
| Perfil o listado por autor de K2: expone nombres de usuario del Joomla (riesgo 1 de requerimientos); se retira a propósito. | 112 |
| Imagen de la plantilla, logo o banner del portal anterior; no es contenido (el portal nuevo usa los vigentes). | 75 |
| Dirección malformada registrada por el archivo web; nunca fue contenido. | 69 |
| Fragmento de código JavaScript que el archivo web registró como si fuera una dirección; nunca fue una página. | 67 |
| Subdominio anterior (transparencia.corphotels.gob.do): su redirección se configura en el DNS y Front Door en el corte (S9, novedad N-32). | 63 |
| Imagen de K2 sin contenido migrado que la use (miniaturas, avatares o artículos retirados). | 51 |
| Ruta interna de un componente de Joomla (K2, formularios, correo, votos, fuentes RSS) sin contenido propio. | 42 |
| Subdominio anterior (new.corphotels.gob.do): su redirección se configura en el DNS y Front Door en el corte (S9, novedad N-32). | 41 |
| Galería de fotos rota en el portal anterior (sus carpetas respondían «Error 404»); sin equivalente en A2 4.02 (novedad N-33). | 33 |
| Foro (Kunena) del portal anterior, fuera de servicio (respondía 503); el portal nuevo no tiene foro. | 18 |
| Sondeo automático de robots; nunca fue contenido del portal. | 15 |
| Recurso del servicio Cloudflare que usaba el portal anterior; no es contenido. | 11 |
| Foto de la galería rota del portal anterior (novedad N-33). | 11 |
| Sección «De interés» con un artículo de otra institución sin fecha; sin equivalente en A2 4.02 (informe de migración). | 11 |
| Página de error del portal anterior; no es contenido. | 11 |
| Recurso técnico de la plantilla anterior (estilos, scripts o fuentes); no es contenido. | 8 |
| Enlace malformado que generaba la plantilla anterior; nunca fue contenido. | 6 |
| Registro e inicio de sesión de usuarios de Joomla: el portal nuevo no tiene cuentas públicas. | 4 |
| Panel de administración de Joomla: no se publica en el portal nuevo (A2 5.02.a). | 2 |
| Foto del personal: dato personal que no se migra; la información del despacho está en «Conoce al Gerente General». | 2 |
| Contenido conservado como borrador en el CMS hasta que se decida su ubicación (novedad N-33). | 2 |
| Archivo técnico: el portal nuevo publica el suyo (S6). | 1 |

## Errores heredados para revisión

No se corrigieron en la migración: se migró el contenido tal como estaba publicado. Cada dueño decide.

| Hallazgo | Cantidad | Dueño |
| --- | --- | --- |
| Documentos sin descripción (se generó una a partir de su carpeta; A2 2.01.b.xiii pide una descripción propia) | 2 | OAI |
| Títulos de documentos escritos todo en mayúsculas y sin tildes | 0 | OAI |
| Títulos repetidos dentro de una misma sección (posibles duplicados, o PDF y Excel del mismo informe) | 847 | OAI |
| Noticias con restos de herramientas de redacción en el texto (por ejemplo «Reporte-Saneamiento-San Gil-14-…») | 0 | Comunicaciones |
| Noticias sin lugar en la entrada (se puso «República Dominicana») | 0 | Comunicaciones |
| Imágenes dentro del texto de noticias y páginas (no se migran; las fotos principales de las noticias sí) | 0 | Comunicaciones |
| Noticias sin foto principal (quedan como borrador hasta que se les agregue; A2 4.02) | 0 | Comunicaciones |
| Páginas del portal anterior que ya respondían con error | 14 | TIC |

### Noticias con restos de herramientas de redacción

_Ninguna._

### Noticias sin lugar

_Ninguna._

### Noticias sin foto principal

_Ninguna._

### Títulos repetidos (primeros 100)

| Sección | Título | Veces |
| --- | --- | --- |
| oai/informacion-clasificada | informacion clasificada ago2018 | 2 |
| compras/comparaciones-precios | convocatoria | 5 |
| compras/comparaciones-precios | pliego de condiciones | 5 |
| compras/comparaciones-precios | solicitud de compra | 7 |
| compras/compras-menores | certificacion presupuestaria | 2 |
| compras/compras-menores | solicitud de compra no.0064 | 2 |
| compras/compras-menores | certificacion de fondo | 30 |
| compras/compras-menores | certificacion de fondos | 25 |
| compras/compras-menores | solicitud de compra | 42 |
| compras/comparaciones-precios | registro de participante | 2 |
| compras/comparaciones-precios | contrato | 5 |
| cep/plan-trabajo | enero-marzo informe de logros y seguimiento plan cep | 2 |
| compras/compras-menores | orden de compra | 19 |
| compras/compras-menores | acta de adjudicacion | 21 |
| compras/compras-menores | cuota comprometer | 21 |
| compras/compras-menores | cuota compromiso | 2 |
| compras/compras-menores | listados de participantes | 2 |
| compras/compras-menores | listado de participantes | 13 |
| compras/compras-menores | orden de compras | 2 |
| compras/debajo-umbral | relacion de compras por debajo del umbral diciembre 2020 | 2 |
| presupuesto/aprobado | presupuesto aprobado 2021 | 2 |
| compras/compras-menores | anexos termino de referencia (formularios) | 2 |
| compras/compras-menores | convocatoria | 23 |
| compras/compras-menores | lista de oferentes | 2 |
| compras/compras-menores | acta de apertura | 3 |
| compras/compras-menores | pliego de condiciones | 24 |
| compras/compras-menores | acta presentacion de ofertas | 2 |
| finanzas/estados-financieros | estado de resultados enero - junio 2021 | 2 |
| finanzas/estados-financieros | estado de flujo de efectivo enero - junio 2021 | 2 |
| finanzas/estados-financieros | estado de cambios de patrimonio enero - junio 2021 | 2 |
| compras/compras-menores | acta desierta | 2 |
| presupuesto/ejecucion | ejecucion meta fisica enero-marzo 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica enero-junio 2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria julio 2021 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad julio 2021 | 2 |
| finanzas/informes-financieros | balance general julio 2021 | 2 |
| finanzas/informes-financieros | balance general agosto 2021 | 2 |
| recursos-humanos/nomina | nomina personal contratado agosto 2021 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad agosto 2021 | 2 |
| recursos-humanos/nomina | nomina personal fijo agosto 2021 | 2 |
| finanzas/informes-financieros | balance general septiembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica abril-junio 2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria septiembre 2021 | 2 |
| compras/comparaciones-precios | anexos formularios | 3 |
| finanzas/informes-financieros | balance general octubre 2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria octubre 2021 | 2 |
| finanzas/ingresos-egresos | relacion de ingresos y egresos octubre 2021 | 2 |
| compras/comparaciones-precios | cuota comprometer | 3 |
| compras/comparaciones-precios | acta de adjudicacion | 4 |
| compras/comparaciones-precios | listado de participantes | 2 |
| compras/comparaciones-precios | certificacion de fondos | 4 |
| compras/compras-menores | lista de participantes | 4 |
| finanzas/informes-financieros | balance general noviembre 2021 | 2 |
| plan-estrategico/memorias | memoria 2018 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad septiembre-2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria noviembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria agosto 2021 | 2 |
| compras/compras-menores | acta administrativa que aprueba el procedimiennto de seleccion para la supervision de los trabajos de remozamiento de la plaza el naranjo | 2 |
| finanzas/informes-financieros | informe de cuentas por pagar diciembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica julio-septiembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica octubre- diciembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica julio-diciembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica enero-diciembre 2021 | 2 |
| finanzas/informes-financieros | balance general diciembre 2021 | 2 |
| finanzas/informes-financieros | balance general enero 2022 | 2 |
| presupuesto/aprobado | presupuesto aprobado 2022 | 2 |
| estadisticas | estadística abril - junio 2021 | 2 |
| estadisticas | estadística enero - marzo 2021 | 2 |
| estadisticas | estadística julio - septiembre 2021 | 2 |
| estadisticas | estadística octubre - diciembre 2021 | 2 |
| recursos-humanos/nomina | nomina personal contratado octubre 2021 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad octubre 2021 | 2 |
| recursos-humanos/nomina | nomina personal fijo octubre 2021 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad noviembre 2021 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad diciembre 2021 | 2 |
| recursos-humanos/nomina | nomina personal contratado diciembre 2021 | 2 |
| recursos-humanos/nomina | nomina personal fijo diciembre 2021 | 2 |
| finanzas/estados-financieros | estado de cambio de patrimono julio - diciembre 2021 | 2 |
| finanzas/estados-financieros | estado de flujo de efectivo julio - diciembre 2021 | 2 |
| compras/casos-excepcion | certificacion de fondos | 2 |
| compras/casos-excepcion | cuota comprometer | 3 |
| compras/casos-excepcion | solicitud de compra | 4 |
| compras/casos-excepcion | pliego de condiciones | 4 |
| finanzas/informes-financieros | balance general febrero 2022 | 2 |
| recursos-humanos/nomina | nomina personal contratado febrero 2022 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad febrero 2022 | 2 |
| recursos-humanos/nomina | nomina personal fijo febrero 2022 | 2 |
| recursos-humanos/nomina | nomina personal contratado enero 2022 | 2 |
| recursos-humanos/nomina | nomina personal de seguridad enero 2022 | 2 |
| recursos-humanos/nomina | nomina personal fijo enero 2022 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria diciembre 2021 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria enero 2022 v2 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria febrero 2022 | 2 |
| finanzas/ingresos-egresos | relacion de ingreso y egreso enero 2022 v2 | 2 |
| finanzas/ingresos-egresos | relacion de ingreso y egreso febrero 2022 | 2 |
| compras/casos-excepcion | acta de adjudicacion | 3 |
| finanzas/informes-financieros | balance general marzo 2022 | 2 |
| presupuesto/ejecucion | ejecucion meta fisica enero-marzo 2022 | 2 |
| presupuesto/ejecucion | ejecucion presupuestaria marzo 2022 | 2 |
| oai/estadisticas | informe estadistica y balance de gestion oai enero-marzo 2022 | 2 |

### Páginas del portal anterior con error

| URL | Estado |
| --- | --- |
| /index.php/foro | 503 |
| /index.php/foro/busqueda | 503 |
| /index.php/foro/credits | 503 |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana | 503 |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana/2-que-te-parece-la-nueva-la-campana-de-ministerio-de-turismo-the-real-rd | 503 |
| /index.php/foro/industria-hotelera-y-sector-turismo-en-republica-dominicana/4-turismo-durante-la-pandemia | 503 |
| /index.php/foro/inicio | 503 |
| /index.php/foro/main-forum | 503 |
| /index.php/foro/statistics | 503 |
| /index.php/foro/suggestion-box | 503 |
| /index.php/foro/temas-recientes | 503 |
| /index.php/foro/turismo | 503 |
| /index.php/foro/welcome-mat | 503 |
| /index.php/foro/welcome-mat/1-welcome-to-kunena | 503 |
