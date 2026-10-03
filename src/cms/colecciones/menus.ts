import type { CollectionConfig, Field } from "payload";
import { con, todos } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";

const enlace: Field[] = [
  { name: "etiqueta", label: "Texto del enlace", type: "text", required: true, maxLength: 60 },
  {
    name: "url",
    label: "Dirección",
    type: "text",
    required: true,
    admin: { description: "Interna (/sobre-nosotros/historia) o externa (https://...). Las externas abren en pestaña nueva." },
    validate: (v: unknown) =>
      typeof v === "string" && (/^\/[a-z0-9\-/]*$/.test(v) || /^https:\/\//.test(v))
        ? true
        : "Use una ruta interna en minúsculas (/ruta) o un enlace https://",
  },
];

/**
 * Menús del portal (A2 5.02.a). El nombre y el orden de las secciones obligatorias no se cambian
 * (A2 4.01.a); por eso solo los administran el administrador y el publicador.
 */
export const Menus: CollectionConfig = {
  slug: "menus",
  labels: { singular: "Menú", plural: "Menús" },
  admin: { useAsTitle: "nombre", group: "Organización", defaultColumns: ["nombre", "ubicacion", "updatedAt"] },
  access: {
    read: todos,
    create: con("administrador"),
    update: con("administrador", "publicador"),
    delete: con("administrador"),
  },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    {
      name: "ubicacion",
      label: "Ubicación",
      type: "select",
      required: true,
      unique: true,
      options: [
        { label: "Menú principal", value: "principal" },
        { label: "Pie: Infórmate", value: "pie-informate" },
      ],
    },
    {
      name: "elementos",
      label: "Elementos",
      type: "array",
      fields: [
        ...enlace,
        {
          name: "hijos",
          label: "Submenú (nivel II)",
          type: "array",
          fields: enlace,
        },
      ],
    },
  ],
};
