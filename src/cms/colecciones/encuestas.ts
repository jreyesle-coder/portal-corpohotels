import type { CollectionConfig } from "payload";
import { con, nadie, tieneRol } from "../acceso";

/**
 * Encuesta de satisfacción al finalizar cada trámite o formulario (A2 5.04.1.iii.a.ii).
 * Es anónima: no se enlaza con los datos personales del caso, solo con su tipo y servicio.
 */
export const Encuestas: CollectionConfig = {
  slug: "encuestas",
  labels: { singular: "Respuesta de encuesta", plural: "Encuesta de satisfacción" },
  admin: {
    group: "Atención ciudadana",
    defaultColumns: ["calificacion", "tipo", "servicio", "createdAt"],
    hidden: ({ user }) => !tieneRol(user, "administrador", "publicador", "auditor"),
  },
  access: {
    read: con("administrador", "publicador", "auditor"),
    create: nadie,
    update: nadie,
    delete: nadie,
  },
  defaultSort: "-createdAt",
  fields: [
    { name: "calificacion", label: "Calificación (1 a 5)", type: "number", required: true, min: 1, max: 5 },
    { name: "facilidad", label: "¿Le resultó fácil completar el proceso?", type: "select", options: ["si", "no"] },
    { name: "comentario", label: "Comentario", type: "textarea", maxLength: 500 },
    { name: "tipo", label: "Proceso", type: "text" },
    { name: "servicio", label: "Servicio", type: "relationship", relationTo: "servicios" },
  ],
};
