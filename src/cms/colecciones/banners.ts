import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { controlPublicacion } from "../flujo-editorial";

/**
 * Apartado de banners de la portada (A2 3.02.e.ii.a). Solo comunicación institucional: sin
 * publicidad comercial (A2 4.01.f). Sin rotación automática (A2 7.01.w).
 */
export const Banners: CollectionConfig = {
  slug: "banners",
  labels: { singular: "Banner", plural: "Banners" },
  admin: { useAsTitle: "titulo", group: "Contenido", defaultColumns: ["titulo", "orden", "_status", "updatedAt"] },
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
    { name: "titulo", label: "Título", type: "text", required: true, maxLength: 90 },
    { name: "descripcion", label: "Descripción", type: "textarea", maxLength: 200 },
    { name: "imagen", label: "Imagen", type: "upload", relationTo: "medios", required: true },
    {
      name: "enlace",
      label: "Enlace",
      type: "text",
      admin: { description: "Ruta interna (/servicios) o enlace https:// de un portal del Estado." },
    },
    { name: "textoEnlace", label: "Texto del enlace", type: "text", maxLength: 40, defaultValue: "Conocer más" },
    { name: "orden", label: "Orden", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
