/**
 * Estructura de la sección de transparencia: NORTIC A2:2023, secciones 4.03 (escritorio) y 4.04
 * (móvil), que recogen la Resolución DIGEIG 002-2021. El orden y los nombres no se cambian (A2 4.01.a),
 * por eso la estructura vive en el código y no en el CMS; la OAI carga los documentos y los textos.
 * Si la DIGEIG emite una resolución nueva, se actualiza este archivo (novedades N-26 y N-27).
 */

export type Enlace = { url: string; texto: string };

export type Subseccion = {
  clave: string;
  titulo: string;
  /** Plataforma externa obligatoria de la subsección (SAIP, 311, Concursa…). */
  enlace?: Enlace;
};

export type SeccionTransparencia = {
  clave: string;
  titulo: string;
  descripcion: string;
  subsecciones?: Subseccion[];
  enlace?: Enlace;
};

export const RUTA_TRANSPARENCIA = "/transparencia";

export const PORTALES = {
  portalUnico: { url: "https://transparencia.gob.do/", texto: "Portal Único de Transparencia del Estado Dominicano" },
  saip: { url: "https://saip.gob.do/", texto: "Portal Único de Solicitud de Acceso a la Información Pública (SAIP)" },
  p311: { url: "https://311.gob.do/", texto: "Sistema 311 de Atención Ciudadana" },
  datosAbiertos: { url: "https://datos.gob.do/", texto: "Portal de Datos Abiertos del Gobierno Dominicano (datos.gob.do)" },
  concursa: { url: "https://map.gob.do/Concursa/", texto: "Portal Concursa del Ministerio de Administración Pública" },
  proveedores: {
    url: "https://www.dgcp.gob.do/servicios/registro-de-proveedores/",
    texto: "Registro de Proveedores del Estado (Dirección General de Contrataciones Públicas)",
  },
} satisfies Record<string, Enlace>;

const normas = (incluirConstitucion: boolean): Subseccion[] => [
  ...(incluirConstitucion ? [{ clave: "constitucion", titulo: "Constitución de la República Dominicana" }] : []),
  { clave: "leyes", titulo: "Leyes" },
  { clave: "decretos", titulo: "Decretos" },
  { clave: "resoluciones", titulo: "Resoluciones" },
  { clave: "otras-normativas", titulo: "Otras Normativas" },
];

/** Las 19 secciones de A2 4.03.b–c, en su orden. */
export const SECCIONES: SeccionTransparencia[] = [
  {
    clave: "base-legal",
    titulo: "Base Legal de la Institución",
    descripcion: "Constitución, leyes, decretos, resoluciones y otras normas que rigen a CORPHOTELS.",
    subsecciones: normas(true),
  },
  {
    clave: "marco-legal",
    titulo: "Marco Legal del Sistema de Transparencia",
    descripcion: "Leyes, decretos, resoluciones y otras normas del sistema nacional de transparencia.",
    subsecciones: normas(false),
  },
  {
    clave: "estructura-organica",
    titulo: "Estructura Orgánica de la Institución",
    descripcion: "Organigrama con los departamentos, unidades y dependencias de la institución.",
  },
  {
    clave: "oai",
    titulo: "Oficina de Libre Acceso a la Información (OAI)",
    descripcion: "Información sobre la OAI y el derecho de acceso a la información pública (Ley 200-04).",
    subsecciones: [
      { clave: "derechos", titulo: "Derecho de los Ciudadanos de Acceder a la Información Pública" },
      { clave: "estructura", titulo: "Estructura Organizacional de la OAI" },
      { clave: "manual-organizacion", titulo: "Manual de Organización de la OAI" },
      { clave: "manual-procedimiento", titulo: "Manual de Procedimiento de la OAI" },
      { clave: "estadisticas", titulo: "Estadísticas y Balance de Gestión de la OAI" },
      { clave: "rai", titulo: "Responsable de Acceso a la Información (RAI)" },
      { clave: "informacion-clasificada", titulo: "Resolución de Información Clasificada" },
      { clave: "indice-documentos", titulo: "Índice de Documentos Disponibles para la Entrega" },
      {
        clave: "saip",
        titulo: "Enlace Directo al Portal Único de Solicitud de Acceso a la Información Pública (SAIP)",
        enlace: { url: PORTALES.saip.url, texto: "Solicitar información en el portal SAIP" },
      },
      { clave: "indice-transparencia", titulo: "Índice de Transparencia Estandarizado" },
    ],
  },
  {
    clave: "plan-estrategico",
    titulo: "Plan Estratégico Institucional",
    descripcion: "Planificación estratégica, plan operativo anual y memorias institucionales.",
    subsecciones: [
      { clave: "planificacion", titulo: "Planificación Estratégica Institucional" },
      { clave: "poa", titulo: "Plan Operativo Anual (POA)" },
      { clave: "memorias", titulo: "Memorias Institucionales" },
    ],
  },
  {
    clave: "publicaciones",
    titulo: "Publicaciones Oficiales",
    descripcion: "Boletines, revistas y otros documentos oficiales de interés público.",
  },
  {
    clave: "estadisticas",
    titulo: "Estadísticas Institucionales",
    descripcion: "Índices, estadísticas y valores oficiales de la institución.",
  },
  {
    clave: "servicios",
    titulo: "Información Básica sobre Servicios Públicos",
    descripcion: "Marco regulatorio, condiciones, tarifas, controles y sanciones de los servicios que presta la institución.",
  },
  {
    clave: "portal-311",
    titulo: "Acceso y Registro al Portal 311 sobre Quejas, Reclamaciones, Sugerencias y Denuncias",
    descripcion: "Enlace al Sistema 311 y estadísticas de las quejas, reclamaciones y sugerencias recibidas.",
    subsecciones: [
      {
        clave: "enlace",
        titulo: "Enlace Directo al Portal 311",
        enlace: { url: PORTALES.p311.url, texto: "Presentar una queja, reclamación, sugerencia o denuncia en el 311" },
      },
      { clave: "estadisticas", titulo: "Estadísticas de las Quejas, Reclamaciones y Sugerencias recibidas a través del 311" },
    ],
  },
  {
    clave: "declaracion-jurada",
    titulo: "Declaración Jurada de Patrimonio",
    descripcion: "Declaraciones juradas de bienes de los funcionarios obligados por la Ley 311-14.",
  },
  {
    clave: "presupuesto",
    titulo: "Presupuesto",
    descripcion: "Presupuesto aprobado del año y su ejecución.",
    subsecciones: [
      { clave: "aprobado", titulo: "Presupuesto Aprobado del Año" },
      { clave: "ejecucion", titulo: "Ejecución del Presupuesto" },
    ],
  },
  {
    clave: "recursos-humanos",
    titulo: "Recursos Humanos",
    descripcion: "Nómina, jubilaciones, pensiones y retiros, y vacantes publicadas en Concursa.",
    subsecciones: [
      { clave: "nomina", titulo: "Nómina de Empleados" },
      { clave: "jubilaciones", titulo: "Jubilaciones, Pensiones y Retiros" },
      {
        clave: "concursa",
        titulo: "Enlace al Portal Concursa Administrado por el Ministerio de Administración Pública (MAP)",
        enlace: { url: PORTALES.concursa.url, texto: "Ver las vacantes en el portal Concursa del MAP" },
      },
    ],
  },
  {
    clave: "programas-asistenciales",
    titulo: "Programas Asistenciales",
    descripcion: "Programas asistenciales, subsidios, ayudas o becas de la institución.",
  },
  {
    clave: "compras",
    titulo: "Compras y Contrataciones",
    descripcion: "Plan anual de compras y procesos de compras y contrataciones de la institución.",
    subsecciones: [
      {
        clave: "registro-proveedor",
        titulo: "Cómo Registrarse como Proveedor del Estado",
        enlace: { url: PORTALES.proveedores.url, texto: "Registrarse como proveedor en la Dirección General de Contrataciones Públicas" },
      },
      { clave: "pacc", titulo: "Plan Anual de Compras y Contrataciones (PACC)" },
      { clave: "licitacion-publica", titulo: "Licitación Pública Nacional e Internacional" },
      { clave: "licitacion-restringida", titulo: "Licitación Restringida" },
      { clave: "sorteo-obras", titulo: "Sorteo de Obras" },
      { clave: "comparaciones-precios", titulo: "Comparaciones de Precios" },
      { clave: "compras-menores", titulo: "Compras Menores" },
      { clave: "subasta-inversa", titulo: "Subasta Inversa" },
      { clave: "debajo-umbral", titulo: "Relación de Compras Por debajo del Umbral" },
      { clave: "mipymes", titulo: "Micros, Pequeñas y Medianas Empresas" },
      { clave: "casos-excepcion", titulo: "Casos de Excepción" },
      { clave: "estados-cuentas-suplidores", titulo: "Relación de Estados de Cuentas de Suplidores" },
    ],
  },
  {
    clave: "proyectos",
    titulo: "Proyectos y Programas",
    descripcion: "Proyectos y programas de la institución, con calendario, presupuesto, plazos, ejecución y supervisión.",
  },
  {
    clave: "finanzas",
    titulo: "Finanzas",
    descripcion: "Estados e informes financieros, ingresos y egresos, auditorías, activos fijos e inventario.",
    subsecciones: [
      { clave: "estados-financieros", titulo: "Estados Financieros" },
      { clave: "informes-financieros", titulo: "Informes Financieros" },
      { clave: "ingresos-egresos", titulo: "Ingresos y Egresos" },
      { clave: "auditorias", titulo: "Informes de Auditorías" },
      { clave: "activos-fijos", titulo: "Activos Fijos" },
      { clave: "inventario", titulo: "Inventario en Almacén" },
    ],
  },
  {
    clave: "datos-abiertos",
    titulo: "Datos Abiertos",
    descripcion: "Conjuntos de datos de la institución en formatos abiertos (NORTIC A3).",
    enlace: { url: PORTALES.datosAbiertos.url, texto: "Ir al Portal de Datos Abiertos datos.gob.do" },
  },
  {
    clave: "cep",
    titulo: "Comisión de Ética Pública (CEP)",
    descripcion: "Miembros, compromiso ético y plan de trabajo de la Comisión de Ética Pública (Decreto 143-17).",
    subsecciones: [
      { clave: "miembros", titulo: "Listado de Miembros y Medios de Contactos" },
      { clave: "compromiso", titulo: "Compromiso Ético" },
      { clave: "plan-trabajo", titulo: "Plan de Trabajo, Informe de Logros y Seguimiento al Plan" },
    ],
  },
  {
    clave: "consulta-publica",
    titulo: "Consulta Pública",
    descripcion: "Proyectos de regulaciones y reglamentos sometidos a consulta de la ciudadanía.",
  },
];

/** Grupos del menú móvil (A2 4.04.c), con enlaces a las secciones hasta el nivel II (3.04.a.iv). */
export type GrupoMovil = { titulo: string; href?: string; elementos?: { titulo: string; href: string }[] };

const r = (ruta: string) => `${RUTA_TRANSPARENCIA}/${ruta}`;

export const GRUPOS_MOVIL: GrupoMovil[] = [
  {
    titulo: "Institucional",
    elementos: [
      { titulo: "Organigrama", href: r("estructura-organica") },
      { titulo: "Plan estratégico", href: r("plan-estrategico") },
      { titulo: "Recursos humanos", href: r("recursos-humanos") },
      { titulo: "Publicaciones", href: r("publicaciones") },
      { titulo: "Estadísticas", href: r("estadisticas") },
      { titulo: "Datos Abiertos", href: r("datos-abiertos") },
    ],
  },
  {
    titulo: "Legal",
    elementos: [
      { titulo: "Base legal", href: r("base-legal") },
      { titulo: "Marco legal", href: r("marco-legal") },
      { titulo: "Derechos", href: r("oai/derechos") },
      { titulo: "Declaraciones", href: r("declaracion-jurada") },
      { titulo: "Comisión de Ética Pública (CEP)", href: r("cep") },
    ],
  },
  {
    titulo: "Oficina de Libre Acceso a la Información",
    elementos: SECCIONES.find((s) => s.clave === "oai")!.subsecciones!.map((s) => ({ titulo: s.titulo, href: r(`oai/${s.clave}`) })),
  },
  {
    titulo: "Servicios",
    elementos: [
      { titulo: "Servicios de la Institución", href: r("servicios") },
      { titulo: "Beneficiarios", href: r("programas-asistenciales") },
      { titulo: "Portal de 311", href: r("portal-311") },
    ],
  },
  {
    titulo: "Financiero",
    elementos: [
      { titulo: "Presupuesto", href: r("presupuesto") },
      { titulo: "Proyectos", href: r("proyectos") },
      { titulo: "Finanzas", href: r("finanzas") },
      { titulo: "Compras y Contrataciones", href: r("compras") },
      // 4.04.a.v ubica «Consultas Públicas» en el grupo Financiero; 4.04.c no la lista (novedad N-27).
      { titulo: "Consultas Públicas", href: r("consulta-publica") },
    ],
  },
  { titulo: "Contactos", href: "/contactos" },
];

/**
 * Lugares de publicación periódica: sus documentos se presentan por año, con el más reciente primero.
 * En los demás (normas, manuales, organigrama) se listan todos los vigentes.
 */
const PERIODICAS = new Set([
  "oai/estadisticas",
  "oai/indice-documentos",
  "oai/indice-transparencia",
  "plan-estrategico/poa",
  "plan-estrategico/memorias",
  "publicaciones",
  "estadisticas",
  "portal-311/estadisticas",
  "presupuesto/aprobado",
  "presupuesto/ejecucion",
  "recursos-humanos/nomina",
  "recursos-humanos/jubilaciones",
  "compras/pacc",
  "compras/licitacion-publica",
  "compras/licitacion-restringida",
  "compras/sorteo-obras",
  "compras/comparaciones-precios",
  "compras/compras-menores",
  "compras/subasta-inversa",
  "compras/debajo-umbral",
  "compras/mipymes",
  "compras/casos-excepcion",
  "compras/estados-cuentas-suplidores",
  "proyectos",
  "finanzas/estados-financieros",
  "finanzas/informes-financieros",
  "finanzas/ingresos-egresos",
  "finanzas/auditorias",
  "finanzas/activos-fijos",
  "finanzas/inventario",
  "cep/plan-trabajo",
  "consulta-publica",
]);

/** Lugar donde se cargan documentos: una sección sin subsecciones o una subsección. */
export type Destino = {
  valor: string;
  ruta: string;
  titulo: string;
  seccion: SeccionTransparencia;
  subseccion?: Subseccion;
  periodica: boolean;
};

/** Todas las secciones y subsecciones que reciben documentos, en orden. */
export const DESTINOS: Destino[] = SECCIONES.flatMap((s) =>
  s.subsecciones?.length
    ? s.subsecciones.map((sub) => ({
        valor: `${s.clave}/${sub.clave}`,
        ruta: r(`${s.clave}/${sub.clave}`),
        titulo: sub.titulo,
        seccion: s,
        subseccion: sub,
        periodica: PERIODICAS.has(`${s.clave}/${sub.clave}`),
      }))
    : [{ valor: s.clave, ruta: r(s.clave), titulo: s.titulo, seccion: s, periodica: PERIODICAS.has(s.clave) }],
);

/** Opciones del CMS: «Sección › Subsección». */
export const OPCIONES_DESTINO = DESTINOS.map((d) => ({
  value: d.valor,
  label: d.subseccion ? `${d.seccion.titulo} › ${d.subseccion.titulo}` : d.seccion.titulo,
}));

export function buscarSeccion(clave: string) {
  return SECCIONES.find((s) => s.clave === clave);
}

export function buscarDestino(valor: string) {
  return DESTINOS.find((d) => d.valor === valor);
}

/** Rutas válidas bajo /transparencia (secciones y subsecciones), para el proxy. */
export const RUTAS_TRANSPARENCIA = new Set([
  ...SECCIONES.map((s) => r(s.clave)),
  ...DESTINOS.map((d) => d.ruta),
]);

/** Periodos de publicación (publicación periódica por categoría y año). */
export const PERIODOS = [
  { label: "Anual", value: "anual" },
  { label: "Primer trimestre (enero-marzo)", value: "t1" },
  { label: "Segundo trimestre (abril-junio)", value: "t2" },
  { label: "Tercer trimestre (julio-septiembre)", value: "t3" },
  { label: "Cuarto trimestre (octubre-diciembre)", value: "t4" },
  ...["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].map(
    (m, i) => ({ label: m[0].toUpperCase() + m.slice(1), value: `m${String(i + 1).padStart(2, "0")}` }),
  ),
] as const;

export const etiquetaPeriodo = (valor?: string | null) => PERIODOS.find((p) => p.value === valor)?.label ?? null;

/** Orden dentro de un año: lo más reciente primero (diciembre antes que enero; el anual al final). */
export function ordenPeriodo(valor?: string | null): number {
  if (!valor || valor === "anual") return 0;
  if (valor.startsWith("t")) return Number(valor.slice(1)) * 3;
  return Number(valor.slice(1));
}
