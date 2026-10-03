import type { CollectionConfig } from "payload";
import { con, PUEDEN_EDITAR, PUEDEN_PUBLICAR, todos } from "../acceso";
import { normalizarNombreArchivo } from "../archivos";
import { auditarCambios, auditarEliminacion } from "../bitacora";

/**
 * Imágenes del portal. Texto alternativo obligatorio y dimensiones guardadas para declarar ancho y
 * alto (A2 7.01.a–b); variantes optimizadas para móvil (A2 2.02.a). Se guardan en Blob Storage.
 */
export const Medios: CollectionConfig = {
  slug: "medios",
  labels: { singular: "Imagen", plural: "Imágenes" },
  admin: { useAsTitle: "alt", group: "Archivos", defaultColumns: ["filename", "alt", "width", "height", "updatedAt"] },
  access: {
    read: todos,
    create: con(...PUEDEN_EDITAR, "oai"),
    update: con(...PUEDEN_EDITAR, "oai"),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: {
    beforeOperation: [normalizarNombreArchivo],
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
  },
  upload: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    imageSizes: [
      { name: "miniatura", width: 400, height: 300, position: "centre" },
      { name: "tarjeta", width: 800, height: 450, position: "centre" },
      { name: "completa", width: 1600, withoutEnlargement: true },
    ],
    formatOptions: { format: "webp", options: { quality: 82 } },
    adminThumbnail: "miniatura",
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      label: "Texto alternativo",
      type: "text",
      required: true,
      maxLength: 150,
      admin: { description: "Describa lo que muestra la imagen para quien no puede verla (A2 7.01.a)." },
    },
    { name: "credito", label: "Crédito o autor", type: "text", maxLength: 120 },
  ],
};
