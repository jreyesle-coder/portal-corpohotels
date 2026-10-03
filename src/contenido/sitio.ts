/**
 * Datos institucionales y de navegación del portal.
 * Desde S2, el portal lee el menú y los datos institucionales del CMS; este archivo es el respaldo si
 * el CMS no responde y la fuente de la carga inicial (npm run sembrar). Los datos marcados con
 * "novedad" están en docs/novedades.md.
 */

export const organismo = {
  nombre: "Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo",
  siglas: "CORPHOTELS",
  /** Título de la portada (A2 7.01.m). */
  tituloPortada:
    "Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS)",
  telefono: "(809) 688-3417",
  /** Respaldo si el CMS no responde; el dato vigente está en «Datos institucionales» del CMS. */
  correo: "info@corphotels.gob.do" as string | null,
  direccion:
    "Av. México esquina 30 de Marzo, edificio de Oficinas Gubernamentales Presidente Profesor Juan Bosch Gaviño, Bloque C, Distrito Nacional, República Dominicana",
};

/** Cabecera opción A (fondo blanco) u opción B (fondo azul), A2 3.02.a. */
export const OPCION_CABECERA: "A" | "B" = "A";

export type EnlaceMenu = {
  etiqueta: string;
  href: string;
  hijos?: EnlaceMenu[];
};

/**
 * Menú principal según la estructura obligatoria de A2 4.02 (orden y nombres sin cambios, 4.01.a).
 * Las rutas internas se construyen en S2 (institucional), S3 (servicios) y S4 (transparencia).
 */
export const menuPrincipal: EnlaceMenu[] = [
  { etiqueta: "Inicio", href: "/" },
  {
    etiqueta: "Sobre nosotros",
    href: "/sobre-nosotros",
    hijos: [
      { etiqueta: "¿Quiénes somos?", href: "/sobre-nosotros/quienes-somos" },
      { etiqueta: "Historia", href: "/sobre-nosotros/historia" },
      { etiqueta: "Organigrama", href: "/sobre-nosotros/organigrama" },
      { etiqueta: "Conoce al Gerente General", href: "/sobre-nosotros/gerente-general" },
      { etiqueta: "Marco legal", href: "/sobre-nosotros/marco-legal" },
    ],
  },
  { etiqueta: "Servicios", href: "/servicios" },
  { etiqueta: "Transparencia", href: "/transparencia" },
  { etiqueta: "Noticias", href: "/noticias" },
  { etiqueta: "Contactos", href: "/contactos" },
];

/** Sección "Infórmate" del pie (A2 3.02.f). */
export const informate: EnlaceMenu[] = [
  { etiqueta: "Términos de uso", href: "/terminos-de-uso" },
  { etiqueta: "Política de privacidad", href: "/politica-de-privacidad" },
  { etiqueta: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
];

export type EnlaceInteres = { nombre: string; siglas: string; url: string };

/**
 * Menú de enlaces de interés, en el orden de A2 4.01.c: Ventanillas, Portales, Instituciones.
 * Novedad N-05: los banners deben usar los logos oficiales aprobados (4.01.c.ii.a);
 * hasta tenerlos se muestran las siglas.
 */
export const enlacesInteres: { seccion: string; enlaces: EnlaceInteres[] }[] = [
  {
    seccion: "Ventanillas",
    enlaces: [
      { nombre: "Ventanilla Única de Inversión", siglas: "VUI", url: "https://vui.gob.do/" },
      { nombre: "Ventanilla Única de Construcción", siglas: "VUC", url: "https://www.vuc.gob.do/" },
      { nombre: "Ventanilla Única de Comercio Exterior", siglas: "VUCE", url: "https://vucerd.gob.do/" },
      { nombre: "Formalízate", siglas: "VUF", url: "https://formalizate.gob.do/" },
    ],
  },
  {
    seccion: "Portales",
    enlaces: [
      { nombre: "Portal del Estado Dominicano", siglas: "RD", url: "https://www.dominicana.gob.do/" },
      { nombre: "Portal de Servicios del Gobierno Dominicano", siglas: "GOB", url: "https://www.gob.do/" },
      { nombre: "Sistema 311 de Atención Ciudadana", siglas: "311", url: "https://www.311.gob.do/" },
      { nombre: "Sistema Nacional de Atención a Emergencias y Seguridad", siglas: "911", url: "https://www.911.gob.do/" },
      {
        nombre: "Observatorio Nacional de la Calidad de los Servicios Públicos",
        siglas: "ONC",
        url: "https://observatorioserviciospublicos.gob.do/",
      },
      { nombre: "Beca tu Futuro", siglas: "BTF", url: "https://www.becas.gob.do/" },
      {
        nombre: "Reporte de Material de Abuso Sexual Infantil en Línea",
        siglas: "IWF",
        url: "https://report.iwf.org.uk/do/",
      },
      {
        nombre: "Divulgación Responsable de Vulnerabilidades del CNCS",
        siglas: "CNCS",
        url: "https://divulgacionresponsable.cncs.gob.do/",
      },
    ],
  },
  {
    seccion: "Instituciones",
    enlaces: [
      { nombre: "Presidencia de la República", siglas: "PR", url: "https://presidencia.gob.do/" },
      { nombre: "Ministerio de Turismo", siglas: "MITUR", url: "https://mitur.gob.do/" },
    ],
  },
];

export type RedSocial = { red: "facebook" | "instagram" | "x" | "youtube"; nombre: string; url: string };

/**
 * Redes oficiales tomadas del portal actual. Máximo 4 en móvil (A2 3.04.c).
 * Novedad N-06: el portal actual enlaza dos canales de YouTube; se omite hasta confirmar el oficial.
 */
export const redesSociales: RedSocial[] = [
  { red: "facebook", nombre: "Facebook", url: "https://www.facebook.com/CORPHOTELSRD" },
  { red: "instagram", nombre: "Instagram", url: "https://www.instagram.com/corphotelsrd" },
  { red: "x", nombre: "X (antes Twitter)", url: "https://x.com/corphotelsrd" },
];

/**
 * Sellos NORTIC obtenidos, 100×100 px (A2 3.02.f). Novedad N-07: confirmar cuáles aplican al
 * portal nuevo; la sección no se muestra vacía (A2 4.01.h).
 */
export const sellosNortic: { nombre: string; imagen: string; url: string }[] = [];
