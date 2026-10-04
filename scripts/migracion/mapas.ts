/**
 * Equivalencias entre el menú del portal anterior y el portal nuevo (S5). Cada entrada lleva su
 * justificación cuando no es una equivalencia directa: el informe de migración las lista para que
 * el dueño de cada sección las valide (OAI para transparencia, Comunicaciones para el portal).
 */

export type Equivalencia = {
  /** Destino en la estructura de transparencia (src/contenido/transparencia.ts). */
  destino: string;
  /** Explicación si la equivalencia no es directa; se revisa con la OAI. */
  revisar?: string;
};

/** Menú del portal de transparencia anterior: ruta tras «/transparencia/index.php/». Incluye el menú móvil. */
export const MAPA_TRANSPARENCIA: Record<string, Equivalencia> = {
  "base-legal": { destino: "base-legal" },
  "base-legal/constitucion-de-la-republica-dominicana": { destino: "base-legal/constitucion" },
  "base-legal/leyes": { destino: "base-legal/leyes" },
  "base-legal/decretos": { destino: "base-legal/decretos" },
  "base-legal/resoluciones": { destino: "base-legal/resoluciones" },
  "base-legal/otras-normativas": { destino: "base-legal/otras-normativas" },
  "marco-legal/baselegal-m": { destino: "base-legal" },
  "marco-legal-de-transparencia": { destino: "marco-legal" },
  "marco-legal-de-transparencia/leyes": { destino: "marco-legal/leyes" },
  "marco-legal-de-transparencia/decretos": { destino: "marco-legal/decretos" },
  "marco-legal-de-transparencia/resoluciones": { destino: "marco-legal/resoluciones" },
  "marco-legal-de-transparencia/normativas": { destino: "marco-legal/otras-normativas" },
  "marco-legal/marcolegal-m": { destino: "marco-legal" },
  "marco-legal/declaraciones": { destino: "declaracion-jurada" },
  "marco-legal/derechos": { destino: "oai/derechos" },
  "marco-legal/comision-de-integridad-gubernamental-y-complimiento-normativo-cigcn": {
    destino: "cep",
    revisar:
      "La Comisión de Integridad Gubernamental y Cumplimiento Normativo (CIGCN) sustituyó a la Comisión de Ética Pública; la A2:2023 aún nombra la CEP (novedad N-31).",
  },
  organigrama: { destino: "estructura-organica" },
  "portal-t/estructura-organica-de-la-institucion": { destino: "estructura-organica" },
  oai: { destino: "oai" },
  "servicios-m/oai-m": { destino: "oai" },
  "oai/derechos-de-los-ciudadanos": { destino: "oai/derechos" },
  "oai/estructura-organizacional-de-la-oai": { destino: "oai/estructura" },
  "oai/manual-de-organizacion-de-la-oai": { destino: "oai/manual-organizacion" },
  "oai/manual-de-procedimientos-de-la-oai": { destino: "oai/manual-procedimiento" },
  "oai/estadisticas-y-balances-de-la-gestion-oai": { destino: "oai/estadisticas" },
  "oai/contactos-del-rai": { destino: "oai/rai" },
  "oai/informacion-clasificada": { destino: "oai/informacion-clasificada" },
  "oai/indice-de-documentos": { destino: "oai/indice-documentos" },
  "oai/portal-de-transparencia-estandarizado": { destino: "oai/indice-transparencia" },
  "oficina-de-libre-acceso-a-la-informacion": { destino: "oai" },
  "oficina-de-libre-acceso-a-la-informacion/estadisticas-y-balance-gestion-oai": { destino: "oai/estadisticas" },
  "oficina-de-libre-acceso-a-la-informacion/estructura-organizacional-oai": { destino: "oai/estructura" },
  "oficina-de-libre-acceso-a-la-informacion/indice-de-documentos-disponibles-para-entregar": { destino: "oai/indice-documentos" },
  "oficina-de-libre-acceso-a-la-informacion/indice-de-transparencia-estandarizado": { destino: "oai/indice-transparencia" },
  "oficina-de-libre-acceso-a-la-informacion/manual-de-procedimientos-oai": { destino: "oai/manual-procedimiento" },
  "oficina-de-libre-acceso-a-la-informacion/manual-organizacional-oai": { destino: "oai/manual-organizacion" },
  "oficina-de-libre-acceso-a-la-informacion/responsable-acceso-a-la-informacion": { destino: "oai/rai" },
  "plan-estrategico": { destino: "plan-estrategico" },
  "portal-t/plan-t": { destino: "plan-estrategico" },
  "plan-estrategico/plan-estrategico-institucional": { destino: "plan-estrategico/planificacion" },
  "plan-estrategico/planes-operativos-anuales": { destino: "plan-estrategico/poa" },
  "plan-estrategico/memorias-institucionales": { destino: "plan-estrategico/memorias" },
  "publicaciones-oficiales": { destino: "publicaciones" },
  "portal-t/publicaciones-m": { destino: "publicaciones" },
  "publicaciones-oficiales/publicaciones-oficiales": { destino: "publicaciones" },
  "publicaciones-oficiales/certificacion-carta-compromiso": {
    destino: "publicaciones",
    revisar: "La Carta Compromiso al Ciudadano no tiene subsección propia en la A2 4.03; se publica en Publicaciones Oficiales.",
  },
  "estadisticas-institucionales": { destino: "estadisticas" },
  "portal-t/estadistica-m": { destino: "estadisticas" },
  "portal-311-sobre-quejas-reclamaciones-sugerencias-y-denuncias": { destino: "portal-311" },
  "portal-311-sobre-quejas-reclamaciones-sugerencias-y-denuncias/estadisticas-de-quejas-reclamaciones-y-sugerencias": {
    destino: "portal-311/estadisticas",
  },
  "declaraciones-juradas-de-bienes": { destino: "declaracion-jurada" },
  presupuesto: { destino: "presupuesto" },
  "financieros-m/presupuesto-m": { destino: "presupuesto" },
  "presupuesto/presupuesto-aprobado-del-ano": { destino: "presupuesto/aprobado" },
  "presupuesto/ejecucion-del-presupuesto": { destino: "presupuesto/ejecucion" },
  "recursos-humanos": { destino: "recursos-humanos" },
  "portal-t/recursoshumanos-t": { destino: "recursos-humanos" },
  "recursos-humanos/nomina": { destino: "recursos-humanos/nomina" },
  "recursos-humanos/jubilaciones-pensiones-y-retiros": { destino: "recursos-humanos/jubilaciones" },
  "recursos-humanos/vacantes": {
    destino: "recursos-humanos/concursa",
    revisar: "Las vacantes se publican en Concursa (MAP); la A2 4.03 no tiene subsección «Vacantes».",
  },
  "beneficiarios-de-programas-asistenciales": { destino: "programas-asistenciales" },
  "servicios-m/beneficiarios-m": { destino: "programas-asistenciales" },
  "compras-y-contrataciones-publicas": { destino: "compras" },
  "financieros-m/compras-y-contrataciones": { destino: "compras" },
  "compras-y-contrataciones-publicas/como-ser-proveedor": { destino: "compras/registro-proveedor" },
  "compras-y-contrataciones-publicas/plan-anual-de-compras": { destino: "compras/pacc" },
  "compras-y-contrataciones-publicas/licitacion-publica-nacional-e-internacional": { destino: "compras/licitacion-publica" },
  "compras-y-contrataciones-publicas/licitaciones-restringidas": { destino: "compras/licitacion-restringida" },
  "compras-y-contrataciones-publicas/sorteos-de-obras": { destino: "compras/sorteo-obras" },
  "compras-y-contrataciones-publicas/comparaciones-de-precios": { destino: "compras/comparaciones-precios" },
  "compras-y-contrataciones-publicas/compras-menores": { destino: "compras/compras-menores" },
  "compras-y-contrataciones-publicas/subasta-inversa": { destino: "compras/subasta-inversa" },
  "compras-y-contrataciones-publicas/micro-pequenas-y-medianas-empresas": { destino: "compras/mipymes" },
  "compras-y-contrataciones-publicas/casos-de-seguridad-y-emergencia-nacional": {
    destino: "compras/casos-excepcion",
    revisar: "Los casos de seguridad y emergencia nacional son casos de excepción (Ley 340-06, art. 6).",
  },
  "compras-y-contrataciones-publicas/casos-de-urgencia": {
    destino: "compras/casos-excepcion",
    revisar: "Los casos de urgencia son casos de excepción (Ley 340-06, art. 6).",
  },
  "compras-y-contrataciones-publicas/otros-casos-de-excepcion": { destino: "compras/casos-excepcion" },
  "compras-y-contrataciones-publicas/estado-de-cuentas-de-suplidores": { destino: "compras/estados-cuentas-suplidores" },
  "compras-y-contrataciones-publicas/listado-de-compras-y-contrataciones-realizadas-y-aprobadas": {
    destino: "compras/debajo-umbral",
    revisar:
      "«Listado de compras y contrataciones realizadas y aprobadas» no tiene equivalente exacto en la A2 4.03; se ubicó en «Relación de Compras por debajo del Umbral» hasta que la OAI indique la subsección correcta.",
  },
  "proyectos-y-programas": { destino: "proyectos" },
  "financieros-m/proyectos-m": { destino: "proyectos" },
  "proyectos-y-programas/calendario-de-ejecucion-a-los-programas-y-proyectos": { destino: "proyectos" },
  "proyectos-y-programas/descripcion-de-los-proyectos-y-programas": { destino: "proyectos" },
  "proyectos-y-programas/informes-de-presupuestos-sobre-programas-y-proyectos": { destino: "proyectos" },
  "proyectos-y-programas/informes-de-seguimientos-a-los-programas-y-proyectos": { destino: "proyectos" },
  finanzas: { destino: "finanzas" },
  "financieros-m/finanzas-m": { destino: "finanzas" },
  "finanzas/balance-general": {
    destino: "finanzas/estados-financieros",
    revisar: "El balance general es un estado financiero; la A2 4.03 no tiene subsección «Balance General».",
  },
  "finanzas/informes-financieros": { destino: "finanzas/informes-financieros" },
  "finanzas/ingresos-y-egresos": { destino: "finanzas/ingresos-egresos" },
  "finanzas/informes-de-auditorias": { destino: "finanzas/auditorias" },
  "finanzas/activos-fijos": { destino: "finanzas/activos-fijos" },
  "finanzas/inventario-en-almacen": { destino: "finanzas/inventario" },
  "datos-abiertos": { destino: "datos-abiertos" },
  "portal-t/datos-abiertos": { destino: "datos-abiertos" },
  "comision-de-etica-publica-cep": { destino: "cep" },
  "comision-de-etica-publica-cep/listado-de-miembros": { destino: "cep/miembros" },
  "comision-de-etica-publica-cep/compromiso-etico": { destino: "cep/compromiso" },
  "comision-de-etica-publica-cep/plan-de-trabajo-e-informes-de-logros-y-seguimiento": { destino: "cep/plan-trabajo" },
  "comision-de-etica-publica-cep/informe-de-logros-y-seguimiento-cep": { destino: "cep/plan-trabajo" },
  "comision-de-etica-publica-cep/codigo-de-etica-institucional": {
    destino: "cep/compromiso",
    revisar: "El Código de Ética Institucional no tiene subsección propia en la A2 4.03; se ubicó junto al Compromiso Ético.",
  },
  "comision-de-etica-publica-cep/comunicado-importante": {
    destino: "cep",
    revisar: "Comunicado sin subsección equivalente en la A2 4.03.",
  },
  "consulta-publica": { destino: "consulta-publica" },
  "financieros-m/consulta-publica": { destino: "consulta-publica" },
  "consulta-publica/procesos-de-consultas-abiertas": { destino: "consulta-publica" },
  "consulta-publica/relacion-de-consultas-publicas": { destino: "consulta-publica" },
};

/**
 * Portal institucional anterior: ruta tras «/index.php/» → ruta nueva. Los contenidos de estas
 * páginas se cargaron en S2 (semillas/portal-actual.json); aquí solo se redirigen.
 */
export const MAPA_PORTAL: Record<string, { destino: string; revisar?: string }> = {
  "": { destino: "/" },
  inicio: { destino: "/" },
  "sobre-nosotros": { destino: "/sobre-nosotros" },
  "sobre-nosotros-m": { destino: "/sobre-nosotros" },
  "sobre-nosotros/quienes-somos": { destino: "/sobre-nosotros/quienes-somos" },
  "sobre-nosotros/historia": { destino: "/sobre-nosotros/historia" },
  "sobre-nosotros/despacho-del-director": { destino: "/sobre-nosotros/gerente-general" },
  despacho: { destino: "/sobre-nosotros/gerente-general" },
  "sobre-nosotros/organigrama": { destino: "/sobre-nosotros/organigrama" },
  "marco-legal": { destino: "/sobre-nosotros/marco-legal" },
  "sobre-nosotros/marco-legal": { destino: "/sobre-nosotros/marco-legal" },
  servicios: { destino: "/servicios" },
  "servicios-m": { destino: "/servicios" },
  noticias: { destino: "/noticias" },
  contacto: { destino: "/contactos" },
  "contactos-m": { destino: "/contactos" },
  "terminos-de-uso": { destino: "/terminos-de-uso" },
  "terminos-de-uso-p": { destino: "/terminos-de-uso" },
  "politica-de-privacidad": { destino: "/politica-de-privacidad" },
  "politicas-de-privacidad-p": { destino: "/politica-de-privacidad" },
  "preguntas-frecuentes": { destino: "/preguntas-frecuentes" },
  "preguntasfre-p": { destino: "/preguntas-frecuentes" },
  transparencia: { destino: "/transparencia" },
};

/** Servicios del portal anterior (K2) → ficha nueva. */
export const SERVICIOS_K2: Record<number, string> = {
  270: "/servicios/actualizacion-de-datos",
  246: "/servicios/certificacion-de-retencion-de-impuestos",
  245: "/servicios/solicitud-de-no-objecion-para-obras",
  234: "/servicios/consulta-de-balance",
};
