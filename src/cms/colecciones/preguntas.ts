import type { CollectionConfig } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { controlPublicacion } from "../flujo-editorial";
import { refrescarBusqueda, refrescarBusquedaAlBorrar } from "@/busqueda/refrescar";

/** Preguntas frecuentes (A2 4.02). */
export const PreguntasFrecuentes: CollectionConfig = {
  slug: "preguntas-frecuentes",
  labels: { singular: "Pregunta frecuente", plural: "Preguntas frecuentes" },
  admin: { useAsTitle: "pregunta", group: "Contenido", defaultColumns: ["pregunta", "orden", "_status"] },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 20 },
  defaultSort: "orden",
  access: {
    read: leerPublicado,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: { beforeChange: [controlPublicacion], afterChange: [auditarCambios, refrescarBusqueda], afterDelete: [auditarEliminacion, refrescarBusquedaAlBorrar] },
  fields: [
    { name: "pregunta", label: "Pregunta", type: "text", required: true, maxLength: 200 },
    { name: "respuesta", label: "Respuesta", type: "richText", required: true },
    { name: "orden", label: "Orden", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
