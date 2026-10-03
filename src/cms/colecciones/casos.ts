import type { CollectionConfig, Field, FieldHook } from "payload";
import { obtenerConfigCms } from "@/config";
import { cifrar, descifrar, estaCifrado } from "@/lib/cifrado";
import { con, nadie, tieneRol } from "../acceso";
import { auditarCambios } from "../bitacora";

/**
 * Casos recibidos por los formularios del portal: contacto, sugerencias y solicitudes de servicio
 * (A2 2.01.b.x–xi). Los datos personales se guardan cifrados (A2 5.05.e, Ley 172-13) y solo los
 * descifra el servidor para quien tiene permiso de leerlos. Solo el servidor crea casos.
 *
 * Atienden los casos el administrador y el publicador; el auditor los lee. Novedad N-20: definir
 * si se crea un rol de atención ciudadana.
 */
const clave = () => obtenerConfigCms().CLAVE_CIFRADO_DATOS;

const alGuardar: FieldHook = ({ value }) =>
  typeof value === "string" && value !== "" && !estaCifrado(value) ? cifrar(value, clave()) : value;

const alLeer: FieldHook = ({ value }) => {
  if (!estaCifrado(value)) return value;
  try {
    return descifrar(value, clave());
  } catch {
    return "[no se pudo descifrar]";
  }
};

const cifrado = (name: string, label: string, tipo: "text" | "textarea" = "text"): Field =>
  ({
    name,
    label,
    type: tipo,
    hooks: { beforeChange: [alGuardar], afterRead: [alLeer] },
    access: { update: () => false },
    admin: { readOnly: true },
  }) as Field;

export const TIPOS_CASO = [
  { label: "Contacto", value: "contacto" },
  { label: "Sugerencia o queja", value: "sugerencia" },
  { label: "Solicitud de servicio", value: "solicitud" },
] as const;

export const ESTADOS_CASO = [
  { label: "Recibido", value: "recibido" },
  { label: "En proceso", value: "en-proceso" },
  { label: "Respondido", value: "respondido" },
  { label: "Cerrado", value: "cerrado" },
] as const;

export const Casos: CollectionConfig = {
  slug: "casos",
  labels: { singular: "Caso", plural: "Casos" },
  admin: {
    useAsTitle: "numero",
    group: "Atención ciudadana",
    defaultColumns: ["numero", "tipo", "asunto", "estado", "createdAt"],
    description: "Contactos, sugerencias y solicitudes recibidos por el portal. Los datos personales están cifrados.",
    hidden: ({ user }) => !tieneRol(user, "administrador", "publicador", "auditor"),
  },
  access: {
    read: con("administrador", "publicador", "auditor"),
    create: nadie,
    update: con("administrador", "publicador"),
    delete: nadie,
  },
  hooks: { afterChange: [auditarCambios] },
  defaultSort: "-createdAt",
  fields: [
    {
      type: "row",
      fields: [
        { name: "numero", label: "Número de caso", type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
        { name: "tipo", label: "Tipo", type: "select", required: true, options: [...TIPOS_CASO], admin: { readOnly: true } },
        {
          name: "estado",
          label: "Estado",
          type: "select",
          required: true,
          defaultValue: "recibido",
          options: [...ESTADOS_CASO],
        },
      ],
    },
    { name: "servicio", label: "Servicio", type: "relationship", relationTo: "servicios", admin: { readOnly: true } },
    { name: "asunto", label: "Asunto", type: "text", maxLength: 150, admin: { readOnly: true } },
    cifrado("nombre", "Nombre"),
    cifrado("correo", "Correo electrónico"),
    cifrado("telefono", "Teléfono"),
    cifrado("cedula", "Cédula"),
    cifrado("mensaje", "Mensaje", "textarea"),
    {
      name: "consentimiento",
      label: "Consentimiento (Ley 172-13)",
      type: "group",
      admin: { readOnly: true },
      fields: [
        { name: "aceptado", label: "Aceptó el tratamiento de sus datos", type: "checkbox", required: true },
        { name: "fecha", label: "Fecha", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "texto", label: "Texto aceptado", type: "textarea" },
      ],
    },
    { name: "notasInternas", label: "Notas internas", type: "textarea", maxLength: 2000 },
  ],
};
