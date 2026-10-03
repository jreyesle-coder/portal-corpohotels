import type { CollectionConfig } from "payload";
import { con, PUEDEN_EDITAR, PUEDEN_PUBLICAR, todos } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSlug } from "../campos";

const comun = {
  access: {
    read: todos,
    create: con(...PUEDEN_EDITAR, "oai"),
    update: con(...PUEDEN_EDITAR, "oai"),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
} satisfies Partial<CollectionConfig>;

/** Categorías y etiquetas (A2 5.02.a). */
export const Categorias: CollectionConfig = {
  slug: "categorias",
  labels: { singular: "Categoría", plural: "Categorías" },
  admin: { useAsTitle: "nombre", group: "Organización" },
  ...comun,
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true, unique: true, maxLength: 80 },
    campoSlug("nombre"),
    { name: "descripcion", label: "Descripción", type: "textarea", maxLength: 300 },
  ],
};

export const Etiquetas: CollectionConfig = {
  slug: "etiquetas",
  labels: { singular: "Etiqueta", plural: "Etiquetas" },
  admin: { useAsTitle: "nombre", group: "Organización" },
  ...comun,
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true, unique: true, maxLength: 60 },
    campoSlug("nombre"),
  ],
};
