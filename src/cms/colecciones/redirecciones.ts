import type { CollectionConfig } from "payload";
import { con } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";

/**
 * Redirecciones 301 desde las URL del portal anterior (S5). Las genera `npm run migracion:importar`
 * y las aplica el proxy antes de responder (src/proxy.ts):
 * - exacta: la URL anterior normalizada (ruta y consulta relevante, ver src/migracion/normalizar.ts);
 * - prefijo: toda URL que empiece igual (secciones del menú anterior con sus páginas internas);
 * - phoca:<sitio>:<id>, phoca-cat:<sitio>:<id> y k2:<id>: descargas `?download=ID`, carpetas de Phoca y
 *   noticias de K2, por su identificador anterior (sitio = portal o transparencia).
 */
export const Redirecciones: CollectionConfig = {
  slug: "redirecciones",
  labels: { singular: "Redirección", plural: "Redirecciones" },
  admin: {
    useAsTitle: "origen",
    group: "Configuración",
    defaultColumns: ["origen", "destino", "tipo", "updatedAt"],
    description: "Direcciones del portal anterior que llevan a su equivalente en el portal nuevo (301).",
  },
  access: {
    read: con("administrador", "auditor"),
    create: con("administrador"),
    update: con("administrador"),
    delete: con("administrador"),
  },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    { name: "origen", label: "URL anterior", type: "text", required: true, unique: true, index: true },
    {
      name: "destino",
      label: "Destino",
      type: "text",
      required: true,
      validate: (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? true : "Use una ruta del portal que empiece con /"),
    },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      defaultValue: "exacta",
      options: [
        { label: "Exacta", value: "exacta" },
        { label: "Prefijo (sección completa)", value: "prefijo" },
        { label: "Identificador anterior", value: "identificador" },
      ],
    },
    { name: "nota", label: "Nota", type: "text", maxLength: 300 },
  ],
};
