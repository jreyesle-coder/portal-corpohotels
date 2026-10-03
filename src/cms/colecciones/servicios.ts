import type { CollectionConfig, Field } from "payload";
import { con, leerPublicado, PUEDEN_EDITAR, PUEDEN_PUBLICAR } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";

/**
 * Ficha de servicio con los 15 campos de la NORTIC A5:2019, sección 2.02.1 (A2 4.02.b.i).
 * Los campos obligatorios se exigen al publicar; un borrador puede guardarse incompleto para que
 * el área responsable lo termine.
 */
export const CANALES = [
  { label: "En línea (portal web)", value: "en-linea" },
  { label: "Presencial", value: "presencial" },
  { label: "Telefónico", value: "telefono" },
  { label: "Correo electrónico", value: "correo" },
] as const;

const texto = (name: string, label: string, description: string, required = true, maxLength = 300): Field => ({
  name,
  label,
  type: "textarea",
  required,
  maxLength,
  admin: { description },
});

export const Servicios: CollectionConfig = {
  slug: "servicios",
  labels: { singular: "Servicio", plural: "Servicios" },
  admin: {
    useAsTitle: "nombre",
    group: "Contenido",
    defaultColumns: ["nombre", "areaResponsable", "_status", "listaParaRevision", "updatedAt"],
    description: "Para publicar un servicio deben completarse los 15 campos de la ficha (NORTIC A5).",
  },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 50 },
  defaultSort: "nombre",
  access: {
    read: leerPublicado,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: { beforeChange: [controlPublicacion], afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identificación",
          fields: [
            { name: "nombre", label: "1. Nombre formal", type: "text", required: true, maxLength: 160 },
            {
              name: "nombreColoquial",
              label: "2. Nombre representativo o coloquial",
              type: "text",
              maxLength: 120,
              admin: { description: "Cómo lo reconoce la ciudadanía, cuando aplique." },
            },
            campoSlug("nombre"),
            {
              name: "resumen",
              label: "Descripción breve (listados y portada)",
              type: "textarea",
              required: true,
              maxLength: 300,
            },
            { name: "contenido", label: "3. Descripción del servicio", type: "richText", required: true },
            texto("dirigidoA", "4. A quién va dirigido", "Por ejemplo: arrendatarios de los complejos administrados por CORPHOTELS."),
          ],
        },
        {
          label: "Responsable y contacto",
          fields: [
            { name: "areaResponsable", label: "5. Área responsable", type: "text", required: true, maxLength: 160 },
            {
              name: "contactoArea",
              label: "6. Contactos del área responsable",
              type: "group",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "telefono", label: "Teléfono", type: "text", required: true, maxLength: 40 },
                    { name: "extension", label: "Extensión", type: "text", maxLength: 10 },
                    { name: "correo", label: "Correo institucional", type: "email", required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Cómo obtenerlo",
          fields: [
            {
              name: "requisitos",
              label: "7. Requerimientos para obtener el servicio",
              type: "array",
              required: true,
              minRows: 1,
              labels: { singular: "Requisito", plural: "Requisitos" },
              fields: [{ name: "texto", label: "Requisito", type: "text", required: true, maxLength: 250 }],
            },
            {
              name: "procedimiento",
              label: "8. Procedimiento a seguir",
              type: "array",
              required: true,
              minRows: 1,
              labels: { singular: "Paso", plural: "Pasos" },
              fields: [{ name: "texto", label: "Paso", type: "text", required: true, maxLength: 250 }],
            },
            texto("horario", "9. Horario de prestación", "Días y horas en que se presta o atiende el servicio."),
            texto("costo", "10. Costo del servicio", "Monto en RD$ y forma de pago, o «Gratuito»."),
            texto(
              "tiempoRespuesta",
              "11. Tiempo de respuesta a la solicitud",
              "Plazo para responder la solicitud, cuando aplique (se muestra también en la confirmación).",
              false,
            ),
            texto("tiempoRealizacion", "12. Tiempo de realización", "Plazo para entregar el resultado del servicio."),
            {
              name: "canales",
              label: "13. Canales de prestación",
              type: "select",
              hasMany: true,
              required: true,
              options: [...CANALES],
            },
            {
              name: "acceso",
              label: "14. Acceso al servicio",
              type: "group",
              admin: { description: "Plataforma para la prestación del servicio, si existe." },
              fields: [
                {
                  name: "solicitudEnLinea",
                  label: "Permitir solicitarlo con el formulario en línea del portal",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "url",
                  label: "Enlace a una plataforma externa",
                  type: "text",
                  admin: { description: "Solo https://, por ejemplo una plataforma de servicios del Estado." },
                  validate: (v: unknown) => (!v || (typeof v === "string" && v.startsWith("https://")) ? true : "Use un enlace https://"),
                },
              ],
            },
            { name: "informacionAdicional", label: "15. Información adicional", type: "richText" },
          ],
        },
      ],
    },
    {
      name: "destacado",
      label: "Destacar en la portada",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "listaParaRevision",
      label: "Lista para revisión",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    campoSeo,
  ],
};
