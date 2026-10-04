import type { Field } from "payload";
import { aSlug, PATRON_SLUG } from "@/lib/slug";

/**
 * Slug de la URL: se genera del campo indicado si se deja vacío y siempre se normaliza a
 * minúsculas sin tildes (A2 6.01.f, 6.01.h).
 */
export function campoSlug(desde = "titulo"): Field {
  return {
    name: "slug",
    label: "Dirección (URL)",
    type: "text",
    required: true,
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: "Se genera del título si se deja vacío. Solo minúsculas, números y guiones.",
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          const base = typeof value === "string" && value.trim() ? value : (data?.[desde] as string | undefined);
          return base ? aSlug(base) : value;
        },
      ],
    },
    validate: (valor: unknown) =>
      typeof valor === "string" && PATRON_SLUG.test(valor)
        ? true
        : "Use solo minúsculas sin tildes, números y guiones (por ejemplo: memoria-anual-2026).",
  };
}

/** Herramientas SEO por página (A2 5.02.a, 6.01.d–e, 6.01.j); se aplican al portal en S6. */
export const campoSeo: Field = {
  name: "seo",
  label: "Buscadores (SEO)",
  type: "group",
  fields: [
    {
      name: "titulo",
      label: "Título para buscadores",
      type: "text",
      maxLength: 70,
      admin: { description: "Si se deja vacío se usa el título. Máximo 70 caracteres." },
    },
    {
      name: "descripcion",
      label: "Meta descripción",
      type: "textarea",
      maxLength: 160,
      admin: { description: "Resumen propio de esta página. Máximo 160 caracteres." },
    },
    {
      name: "noIndexar",
      label: "No indexar en buscadores",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};

/**
 * Procedencia del contenido migrado del portal anterior (S5): URL e identificador en el Joomla.
 * Permite repetir la migración sin duplicar y generar las redirecciones 301.
 */
export const campoOrigen: Field = {
  name: "origen",
  label: "Origen en el portal anterior",
  type: "group",
  admin: { position: "sidebar", readOnly: true, condition: (datos) => Boolean(datos?.origen?.url) },
  fields: [
    { name: "url", label: "URL anterior", type: "text", index: true },
    { name: "identificador", label: "Identificador anterior", type: "text", index: true },
  ],
};
