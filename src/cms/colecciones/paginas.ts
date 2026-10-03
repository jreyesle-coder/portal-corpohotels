import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";

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
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
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
    { name: "contenido", label: "Contenido", type: "richText", required: true },
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
