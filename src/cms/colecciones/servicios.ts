import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";

/**
 * Catálogo de servicios. En S2 sostiene la sección Servicios y los destacados de la portada;
 * en S3 se amplía a la ficha de 15 campos de la NORTIC A5 (A2 4.02.b).
 */
export const Servicios: CollectionConfig = {
  slug: "servicios",
  labels: { singular: "Servicio", plural: "Servicios" },
  admin: { useAsTitle: "nombre", group: "Contenido", defaultColumns: ["nombre", "destacado", "_status", "updatedAt"] },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 50 },
  defaultSort: "nombre",
  access: {
    read: leerPublicado,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: { beforeChange: [controlPublicacion], afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    { name: "nombre", label: "Nombre del servicio", type: "text", required: true, maxLength: 160 },
    campoSlug("nombre"),
    { name: "resumen", label: "Descripción breve", type: "textarea", required: true, maxLength: 300 },
    { name: "contenido", label: "Descripción completa", type: "richText", required: true },
    {
      name: "destacado",
      label: "Destacar en la portada",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    campoSeo,
  ],
};
