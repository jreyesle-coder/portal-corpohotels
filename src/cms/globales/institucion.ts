import type { GlobalConfig } from "payload";
import { con, todos } from "../acceso";

/**
 * Datos institucionales que usan la cabecera, el pie (A2 3.02.f) y Contactos (A2 4.02:
 * dirección, apartado, mapa, teléfono y correo). Solo el administrador los modifica.
 */
export const Institucion: GlobalConfig = {
  slug: "institucion",
  label: "Datos institucionales",
  admin: { group: "Organización" },
  access: { read: todos, update: con("administrador") },
  fields: [
    {
      type: "row",
      fields: [
        { name: "nombre", label: "Nombre oficial", type: "text", required: true },
        { name: "siglas", label: "Siglas", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "telefono", label: "Teléfono", type: "text", required: true },
        { name: "fax", label: "Fax", type: "text" },
        { name: "correo", label: "Correo electrónico", type: "email", required: true },
      ],
    },
    { name: "direccion", label: "Dirección de la sede principal", type: "textarea", required: true },
    { name: "apartadoPostal", label: "Apartado postal", type: "text" },
    { name: "horario", label: "Horario de atención", type: "text" },
    {
      name: "mapa",
      label: "Ubicación en el mapa",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "latitud", label: "Latitud", type: "number", required: true, min: -90, max: 90 },
            { name: "longitud", label: "Longitud", type: "number", required: true, min: -180, max: 180 },
          ],
        },
      ],
    },
    {
      name: "atencion",
      label: "Atención ciudadana (se muestra al confirmar formularios, A2 2.01.b.x–xi)",
      type: "group",
      fields: [
        {
          name: "tiempoContacto",
          label: "Tiempo de respuesta a mensajes de contacto",
          type: "text",
          required: true,
          defaultValue: "5 días laborables",
        },
        {
          name: "tiempoSugerencias",
          label: "Tiempo de respuesta a sugerencias y quejas",
          type: "text",
          required: true,
          defaultValue: "15 días laborables",
        },
        {
          name: "otrasVias",
          label: "Otras vías de contacto",
          type: "textarea",
          maxLength: 300,
          admin: { description: "Por ejemplo, el horario de atención presencial." },
        },
      ],
    },
    {
      name: "redes",
      label: "Redes sociales oficiales",
      type: "array",
      maxRows: 6,
      admin: { description: "En móvil se muestran las 4 primeras (A2 3.04.c). Íconos oficiales, sin complementos." },
      fields: [
        {
          name: "red",
          label: "Red",
          type: "select",
          required: true,
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "X (antes Twitter)", value: "x" },
            { label: "YouTube", value: "youtube" },
          ],
        },
        { name: "url", label: "Enlace", type: "text", required: true },
      ],
    },
  ],
};
