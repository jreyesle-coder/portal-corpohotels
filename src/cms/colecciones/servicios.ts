import { APIError, type Access, type CollectionConfig, type Field, type Where } from "payload";
import { obtenerConfigCms } from "@/config";
import { con, PUEDEN_EDITAR, PUEDEN_PUBLICAR, ROLES, tieneRol } from "../acceso";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoSeo, campoSlug } from "../campos";
import { controlPublicacion } from "../flujo-editorial";
import { refrescarBusqueda, refrescarBusquedaAlBorrar } from "@/busqueda/refrescar";

/**
 * Ficha de servicio con los 15 campos de la NORTIC A5:2019, sección 2.02.1 (A2 4.02.b.i).
 *
 * Decisión de TIC (2026-10-03): en desarrollo y QA un servicio puede publicarse solo con nombre y
 * descripción, como en el portal actual. En producción (EXIGIR_FICHA_A5_COMPLETA=1) no se puede
 * publicar sin la ficha completa y el portal no muestra los incompletos. El despliegue a
 * producción se detiene si `npm run fichas-pendientes` encuentra alguno (novedad N-20).
 */
const exigirFicha = () => obtenerConfigCms().EXIGIR_FICHA_A5_COMPLETA === "1";

/** El público solo ve lo publicado y, en producción, solo con la ficha completa. */
const leerServicios: Access = ({ req }) => {
  if (tieneRol(req.user, ...ROLES)) return true;
  const publicado: Where = { _status: { equals: "published" } };
  return exigirFicha() ? { and: [publicado, { fichaCompleta: { equals: true } }] } : publicado;
};
export const CANALES = [
  { label: "En línea (portal web)", value: "en-linea" },
  { label: "Presencial", value: "presencial" },
  { label: "Telefónico", value: "telefono" },
  { label: "Correo electrónico", value: "correo" },
] as const;

const texto = (name: string, label: string, description: string, maxLength = 300): Field => ({
  name,
  label,
  type: "textarea",
  maxLength,
  admin: { description },
});

type DatosServicio = Record<string, unknown> & {
  contactoArea?: { telefono?: string | null; correo?: string | null } | null;
  requisitos?: unknown[] | null;
  procedimiento?: unknown[] | null;
  canales?: unknown[] | null;
};

/** Campos que exige la ficha A5 (el nombre coloquial, el tiempo de respuesta y la información adicional aplican «cuando corresponda»). */
export function camposFaltantes(d: DatosServicio): string[] {
  const vacio = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
  const faltan: string[] = [];
  const revisar: [unknown, string][] = [
    [d.contenido, "Descripción"],
    [d.dirigidoA, "A quién va dirigido"],
    [d.areaResponsable, "Área responsable"],
    [d.contactoArea?.telefono, "Teléfono del área"],
    [d.contactoArea?.correo, "Correo del área"],
    [d.requisitos, "Requisitos"],
    [d.procedimiento, "Procedimiento"],
    [d.horario, "Horario"],
    [d.costo, "Costo"],
    [d.tiempoRealizacion, "Tiempo de realización"],
    [d.canales, "Canales"],
  ];
  for (const [valor, nombre] of revisar) if (vacio(valor)) faltan.push(nombre);
  return faltan;
}

export const Servicios: CollectionConfig = {
  slug: "servicios",
  labels: { singular: "Servicio", plural: "Servicios" },
  admin: {
    useAsTitle: "nombre",
    group: "Contenido",
    defaultColumns: ["nombre", "fichaCompleta", "_status", "updatedAt"],
    description: "Complete los 15 campos de la ficha (NORTIC A5). Antes de producción, todos los servicios publicados deben tener la ficha completa.",
  },
  versions: { drafts: { schedulePublish: false }, maxPerDoc: 50 },
  defaultSort: "nombre",
  access: {
    read: leerServicios,
    create: con(...PUEDEN_EDITAR),
    update: con(...PUEDEN_EDITAR),
    delete: con(...PUEDEN_PUBLICAR),
  },
  hooks: {
    beforeChange: [
      controlPublicacion,
      ({ data, originalDoc }) => {
        const faltan = camposFaltantes({ ...(originalDoc ?? {}), ...data } as DatosServicio);
        if (exigirFicha() && data._status === "published" && faltan.length > 0) {
          throw new APIError(`No se puede publicar sin la ficha A5 completa. Falta: ${faltan.join(", ")}.`, 400, undefined, true);
        }
        return { ...data, fichaCompleta: faltan.length === 0, camposPendientes: faltan.join(", ") };
      },
    ],
    afterChange: [auditarCambios, refrescarBusqueda],
    afterDelete: [auditarEliminacion, refrescarBusquedaAlBorrar],
  },
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
            { name: "areaResponsable", label: "5. Área responsable", type: "text", maxLength: 160 },
            {
              name: "contactoArea",
              label: "6. Contactos del área responsable",
              type: "group",
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "telefono", label: "Teléfono", type: "text", maxLength: 40 },
                    { name: "extension", label: "Extensión", type: "text", maxLength: 10 },
                    { name: "correo", label: "Correo institucional", type: "email" },
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
              labels: { singular: "Requisito", plural: "Requisitos" },
              fields: [{ name: "texto", label: "Requisito", type: "text", required: true, maxLength: 250 }],
            },
            {
              name: "procedimiento",
              label: "8. Procedimiento a seguir",
              type: "array",
              labels: { singular: "Paso", plural: "Pasos" },
              fields: [{ name: "texto", label: "Paso", type: "text", required: true, maxLength: 250 }],
            },
            texto("horario", "9. Horario de prestación", "Días y horas en que se presta o atiende el servicio."),
            texto("costo", "10. Costo del servicio", "Monto en RD$ y forma de pago, o «Gratuito»."),
            texto(
              "tiempoRespuesta",
              "11. Tiempo de respuesta a la solicitud",
              "Plazo para responder la solicitud, cuando aplique (se muestra también en la confirmación).",
            ),
            texto("tiempoRealizacion", "12. Tiempo de realización", "Plazo para entregar el resultado del servicio."),
            {
              name: "canales",
              label: "13. Canales de prestación",
              type: "select",
              hasMany: true,
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
      name: "fichaCompleta",
      label: "Ficha A5 completa",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", readOnly: true, description: "Lo calcula el CMS al guardar." },
    },
    {
      name: "camposPendientes",
      label: "Campos pendientes de la ficha",
      type: "textarea",
      admin: { position: "sidebar", readOnly: true, condition: (d) => !d?.fichaCompleta },
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
