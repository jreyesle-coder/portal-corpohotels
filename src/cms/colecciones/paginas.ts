import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";
import { refrescarBusqueda, refrescarBusquedaAlBorrar } from "@/busqueda/refrescar";

/** Páginas institucionales (Sobre nosotros, Términos de uso, etc.; estructura A2 4.02 en S2). */
export const Paginas: CollectionConfig = {
  slug: "paginas",
  labels: { singular: "Página", plural: "Páginas" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "slug", "_status", "listaParaRevision", "updatedAt"],
    group: "Contenido",
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
      name: "padre",
      label: "Sección superior",
      type: "relationship",
      relationTo: "paginas",
      admin: { position: "sidebar", description: "Por ejemplo, «Historia» va dentro de «Sobre nosotros»." },
    },
    {
      name: "imagen",
      label: "Imagen principal",
      type: "upload",
      relationTo: "medios",
      admin: { description: "Por ejemplo, la foto de las instalaciones (Quiénes somos) o del Gerente General." },
    },
    { name: "contenido", label: "Contenido", type: "richText", required: true },
    {
      name: "documentos",
      label: "Documentos descargables",
      type: "relationship",
      relationTo: "documentos",
      hasMany: true,
      admin: { description: "Se muestran al final con descripción, tamaño, fecha y tipo (p. ej., el organigrama)." },
    },
    {
      name: "listaParaRevision",
      label: "Lista para revisión",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    campoSeo,
  ],
};
