import type { CollectionConfig } from "payload";
import { con, nadie } from "../acceso";
import { EVENTOS } from "../bitacora";

const ETIQUETAS: Record<(typeof EVENTOS)[number], string> = {
  inicio_sesion: "Inicio de sesión",
  inicio_sesion_rechazado: "Inicio de sesión rechazado",
  cierre_sesion: "Cierre de sesión",
  creacion: "Creación",
  modificacion: "Modificación",
  publicacion: "Publicación",
  despublicacion: "Despublicación",
  eliminacion: "Eliminación",
  cambio_permisos: "Cambio de permisos",
};

/**
 * Bitácora append-only (A8 3.01.5.d, 3.04.3). Nadie crea, modifica ni borra desde el panel o la
 * API: solo el servidor inserta (overrideAccess) y PostgreSQL rechaza UPDATE, DELETE y TRUNCATE.
 */
export const Bitacora: CollectionConfig = {
  slug: "bitacora",
  labels: { singular: "Evento", plural: "Bitácora" },
  admin: {
    useAsTitle: "evento",
    group: "Seguridad",
    defaultColumns: ["fecha", "evento", "usuarioCorreo", "coleccion", "titulo", "ip"],
    description: "Registro inalterable de accesos, permisos y publicaciones. Solo lectura.",
    hidden: ({ user }) => !["administrador", "auditor"].some((r) => (user?.roles as string[] | undefined)?.includes(r)),
  },
  access: {
    read: con("administrador", "auditor"),
    create: nadie,
    update: nadie,
    delete: nadie,
  },
  timestamps: false,
  defaultSort: "-fecha",
  fields: [
    { name: "fecha", label: "Fecha", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    {
      name: "evento",
      label: "Evento",
      type: "select",
      required: true,
      index: true,
      options: EVENTOS.map((value) => ({ value, label: ETIQUETAS[value] })),
    },
    { name: "usuarioId", label: "ID de usuario", type: "text" },
    { name: "usuarioCorreo", label: "Usuario", type: "text", index: true },
    { name: "coleccion", label: "Colección", type: "text" },
    { name: "documentoId", label: "ID del documento", type: "text" },
    { name: "titulo", label: "Título", type: "text" },
    { name: "ip", label: "Dirección IP", type: "text" },
    { name: "detalle", label: "Detalle", type: "json" },
  ],
};
