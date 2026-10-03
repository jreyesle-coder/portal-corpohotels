import type { CollectionConfig } from "payload";
import { SECCIONES, OPCIONES_DESTINO } from "@/contenido/transparencia";
import { con, todos } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";

/** Portada, secciones con subsecciones y lugares de carga, sin repetir. */
const OPCIONES = [
  { value: "inicio", label: "Inicio Transparencia" },
  ...SECCIONES.filter((s) => s.subsecciones?.length).map((s) => ({ value: s.clave, label: `${s.titulo} (presentación)` })),
  ...OPCIONES_DESTINO,
];

/**
 * Textos de la sección de transparencia, a cargo de la OAI: presentación de una sección y contenido
 * que no es un documento (datos del RAI, derechos del ciudadano, miembros de la CEP, programas…).
 * La OAI responde por la sección de transparencia (Ley 200-04), por eso publica sin otro aprobador.
 */
export const TextosTransparencia: CollectionConfig = {
  slug: "textos-transparencia",
  labels: { singular: "Texto de transparencia", plural: "Textos de transparencia" },
  admin: {
    useAsTitle: "seccion",
    group: "Transparencia",
    defaultColumns: ["seccion", "updatedAt"],
    description: "Texto que se muestra arriba de los documentos de una sección de transparencia.",
  },
  access: {
    read: todos,
    create: con("oai", "administrador"),
    update: con("oai", "administrador"),
    delete: con("oai", "administrador"),
  },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    { name: "seccion", label: "Sección", type: "select", required: true, unique: true, options: OPCIONES },
    { name: "contenido", label: "Contenido", type: "richText", required: true },
  ],
};
