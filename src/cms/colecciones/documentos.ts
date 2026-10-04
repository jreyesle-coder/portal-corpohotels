import { APIError, type Access, type CollectionBeforeChangeHook, type CollectionConfig, type Where } from "payload";
import { OPCIONES_DESTINO, PERIODOS } from "@/contenido/transparencia";
import { tieneRol, todos } from "../acceso";
import { normalizarNombreArchivo, TIPOS_DOCUMENTO } from "../archivos";
import { auditarCambios, auditarEliminacion } from "../bitacora";
import { campoOrigen } from "../campos";
import { refrescarBusqueda, refrescarBusquedaAlBorrar } from "@/busqueda/refrescar";

/**
 * Gestor documental. Cada descarga muestra descripción, tamaño, fecha de creación y tipo
 * (A2 2.01.b.xiii): la descripción y la fecha se capturan aquí; tamaño y tipo los calcula el CMS.
 * Área institucional: editores y publicadores. Área de transparencia: la OAI, que clasifica cada
 * documento por sección, año y periodo (A2 4.03; publicación periódica por categoría y año).
 */
const areaPermitida = (usuario: unknown): Where | boolean => {
  if (tieneRol(usuario, "publicador", "administrador")) return true;
  const areas = [
    ...(tieneRol(usuario, "editor") ? ["institucional"] : []),
    ...(tieneRol(usuario, "oai") ? ["transparencia"] : []),
  ];
  return areas.length ? { area: { in: areas } } : false;
};

const modificar: Access = ({ req }) => areaPermitida(req.user);

const crear: Access = ({ req }) => tieneRol(req.user, "editor", "oai", "publicador", "administrador");

const validarArea: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!req.user) return data;
  const permitido = areaPermitida(req.user);
  if (permitido === true) return data;
  const areas = permitido ? ((permitido as { area: { in: string[] } }).area.in ?? []) : [];
  if (!areas.includes(String(data.area))) {
    throw new APIError("Su rol no puede gestionar documentos de esta área.", 403, undefined, true);
  }
  return data;
};

export const Documentos: CollectionConfig = {
  slug: "documentos",
  labels: { singular: "Documento", plural: "Documentos" },
  admin: {
    useAsTitle: "titulo",
    group: "Archivos",
    defaultColumns: ["titulo", "area", "fechaCreacion", "mimeType", "filesize"],
  },
  access: { read: todos, create: crear, update: modificar, delete: modificar },
  hooks: {
    beforeOperation: [normalizarNombreArchivo],
    beforeChange: [validarArea],
    afterChange: [auditarCambios, refrescarBusqueda],
    afterDelete: [auditarEliminacion, refrescarBusquedaAlBorrar],
  },
  upload: { mimeTypes: TIPOS_DOCUMENTO },
  fields: [
    { name: "titulo", label: "Título", type: "text", required: true, maxLength: 200 },
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      required: true,
      maxLength: 500,
      admin: { description: "Qué contiene el documento, en lenguaje simple." },
    },
    {
      name: "fechaCreacion",
      label: "Fecha de creación del documento",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" } },
    },
    {
      name: "area",
      label: "Área",
      type: "select",
      required: true,
      // La OAI solo carga en transparencia: el formulario ya lo trae elegido.
      defaultValue: ({ user }) => (tieneRol(user, "oai") && !tieneRol(user, "editor", "publicador", "administrador") ? "transparencia" : "institucional"),
      options: [
        { label: "Institucional", value: "institucional" },
        { label: "Transparencia", value: "transparencia" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "seccion",
      label: "Sección del portal",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Marco legal", value: "marco-legal" },
        { label: "Organigrama", value: "organigrama" },
      ],
      admin: { position: "sidebar", condition: (datos) => datos?.area !== "transparencia" },
    },
    {
      name: "seccionTransparencia",
      label: "Sección de transparencia",
      type: "select",
      index: true,
      options: OPCIONES_DESTINO,
      admin: {
        condition: (datos) => datos?.area === "transparencia",
        description: "Sección o subsección del menú de transparencia donde se publica (Resolución DIGEIG 002-2021).",
      },
      validate: (valor: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.area !== "transparencia" || valor ? true : "Indique la sección de transparencia.",
    },
    {
      type: "row",
      admin: { condition: (datos) => datos?.area === "transparencia" },
      fields: [
        {
          name: "anio",
          label: "Año",
          type: "number",
          min: 1990,
          max: 2100,
          index: true,
          defaultValue: () => new Date().getFullYear(),
          admin: { description: "Año al que corresponde la información.", width: "50%" },
          validate: (valor: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            siblingData?.area !== "transparencia" || (typeof valor === "number" && valor >= 1990 && valor <= 2100)
              ? true
              : "Indique el año (1990-2100).",
        },
        {
          name: "periodo",
          label: "Periodo",
          type: "select",
          options: [...PERIODOS],
          admin: { description: "Mes, trimestre o anual, si la publicación es periódica.", width: "50%" },
        },
      ],
    },
    {
      name: "tipoNorma",
      label: "Tipo de norma",
      type: "select",
      options: [
        { label: "Constitución", value: "constitucion" },
        { label: "Leyes", value: "ley" },
        { label: "Decretos", value: "decreto" },
        { label: "Resoluciones", value: "resolucion" },
        { label: "Reglamentos", value: "reglamento" },
        { label: "Normativas", value: "normativa" },
        { label: "Otras normas", value: "otra" },
      ],
      admin: {
        position: "sidebar",
        condition: (_, datos) => datos?.seccion === "marco-legal",
        description: "El Marco legal se presenta agrupado por tipo y ordenado por fecha (A2 4.02).",
      },
      validate: (valor: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.seccion !== "marco-legal" || valor ? true : "Indique el tipo de norma.",
    },
    {
      name: "categoria",
      label: "Categoría",
      type: "relationship",
      relationTo: "categorias",
      admin: { position: "sidebar" },
    },
    campoOrigen,
  ],
};
