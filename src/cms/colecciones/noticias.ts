import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoOrigen, campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";
import { refrescarBusqueda, refrescarBusquedaAlBorrar } from "@/busqueda/refrescar";

/** Noticias: título, fecha, lugar, imagen y fuente (A2 4.02); fuente externa citada (4.01.d–e). */
export const Noticias: CollectionConfig = {
  slug: "noticias",
  labels: { singular: "Noticia", plural: "Noticias" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "fecha", "_status", "listaParaRevision", "updatedAt"],
    group: "Contenido",
    description: "El editor guarda borradores y los marca como listos; el publicador los aprueba y publica.",
  },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 50 },
  access: {
    read: leerPublicado,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: {
    beforeChange: [controlPublicacion],
    afterChange: [auditarCambios, refrescarBusqueda],
    afterDelete: [auditarEliminacion, refrescarBusquedaAlBorrar],
  },
  fields: [
    { name: "titulo", label: "Título", type: "text", required: true, maxLength: 160 },
    campoSlug(),
    {
      type: "row",
      fields: [
        { name: "fecha", label: "Fecha", type: "date", required: true, defaultValue: () => new Date().toISOString() },
        { name: "lugar", label: "Lugar", type: "text", required: true, maxLength: 120 },
      ],
    },
    {
      name: "imagen",
      label: "Imagen principal",
      type: "upload",
      relationTo: "medios",
      required: true,
    },
    { name: "resumen", label: "Resumen", type: "textarea", required: true, maxLength: 300 },
    { name: "contenido", label: "Contenido", type: "richText", required: true },
    {
      name: "fuente",
      label: "Fuente",
      type: "group",
      admin: { description: "Si el contenido proviene de una fuente externa, indíquela con su enlace directo." },
      fields: [
        { name: "nombre", label: "Nombre de la fuente", type: "text", defaultValue: "CORPHOTELS" },
        { name: "url", label: "Enlace a la fuente", type: "text" },
      ],
    },
    {
      name: "categorias",
      label: "Categorías",
      type: "relationship",
      relationTo: "categorias",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "etiquetas",
      label: "Etiquetas",
      type: "relationship",
      relationTo: "etiquetas",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "listaParaRevision",
      label: "Lista para revisión",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "El editor la marca cuando el borrador está listo para publicar." },
    },
    campoSeo,
    campoOrigen,
  ],
};
