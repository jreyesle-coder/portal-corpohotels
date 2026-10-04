import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { controlPublicacion } from "../flujo-editorial";

/**
 * Carrusel principal de la portada (debajo del menú, a todo lo ancho). Cada diapositiva es una
 * noticia (toma su foto, título y enlace) o un aviso propio. Se muestra entre «Desde» y «Hasta».
 * Si no hay diapositivas vigentes, el carrusel muestra las últimas noticias con foto.
 * Solo comunicación institucional, sin publicidad comercial (A2 4.01.f).
 */
export const Diapositivas: CollectionConfig = {
  slug: "diapositivas",
  labels: { singular: "Diapositiva del carrusel", plural: "Carrusel principal" },
  admin: {
    useAsTitle: "titulo",
    group: "Portada",
    defaultColumns: ["titulo", "noticia", "orden", "desde", "hasta", "_status"],
    description: "Lo que pasa en el carrusel grande de la portada. El avance automático se ajusta en Portada › Ajustes.",
  },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 20 },
  defaultSort: "orden",
  access: {
    read: leerPublicado,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: { beforeChange: [controlPublicacion], afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    {
      name: "noticia",
      label: "Noticia",
      type: "relationship",
      relationTo: "noticias",
      admin: { description: "Si elige una noticia, se usan su foto, su título y su enlace; los campos de abajo son opcionales." },
    },
    {
      name: "titulo",
      label: "Título",
      type: "text",
      maxLength: 140,
      admin: { description: "Obligatorio si no elige una noticia." },
      validate: (v: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        v || siblingData?.noticia ? true : "Escriba un título o elija una noticia.",
    },
    {
      name: "imagen",
      label: "Imagen",
      type: "upload",
      relationTo: "medios",
      admin: { description: "Horizontal, al menos 1600 × 600 px. Obligatoria si no elige una noticia." },
      validate: (v: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        v || siblingData?.noticia ? true : "Elija una imagen o una noticia.",
    },
    {
      name: "enlace",
      label: "Enlace",
      type: "text",
      admin: { description: "Ruta interna (/servicios) o enlace https:// de un portal del Estado." },
      validate: (v: unknown) =>
        !v || (typeof v === "string" && (v.startsWith("/") || v.startsWith("https://"))) ? true : "Use una ruta interna o un enlace https://",
    },
    { name: "textoBoton", label: "Texto del botón", type: "text", maxLength: 30, defaultValue: "Leer más" },
    {
      type: "row",
      fields: [
        { name: "desde", label: "Mostrar desde", type: "date", admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } } },
        { name: "hasta", label: "Mostrar hasta", type: "date", admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "orden", label: "Orden", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
