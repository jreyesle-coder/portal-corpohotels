import "server-only";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { cache } from "react";
import { type EnlaceMenu, informate, menuPrincipal, organismo, redesSociales, type RedSocial } from "@/contenido/sitio";
import type { Institucion, Medio } from "@/payload-types";

/**
 * Lectura del contenido del CMS para el portal público. Siempre con los permisos del público
 * (overrideAccess: false): solo se ve lo publicado. `cache` evita consultas repetidas en una misma
 * página. Si el CMS no responde, la cabecera y el pie usan los datos de respaldo de src/contenido.
 */
const cms = cache(() => getPayload({ config }));
/** Al compilar la imagen no hay base de datos: las páginas pre-generadas usan los datos de respaldo. */
const compilando = () => process.env.NEXT_PHASE === "phase-production-build";
const publico = { overrideAccess: false, depth: 1 } as const;

export type DatosInstitucion = {
  nombre: string;
  siglas: string;
  telefono: string;
  fax?: string | null;
  correo: string | null;
  direccion: string;
  apartadoPostal?: string | null;
  horario?: string | null;
  mapa?: Institucion["mapa"];
  redes: RedSocial[];
  atencion: { tiempoContacto: string; tiempoSugerencias: string; otrasVias?: string | null };
};

/** Respaldo si el CMS no responde; los valores vigentes se editan en «Datos institucionales». */
const ATENCION_RESPALDO = { tiempoContacto: "5 días laborables", tiempoSugerencias: "15 días laborables" };

const NOMBRES_RED: Record<RedSocial["red"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (antes Twitter)",
  youtube: "YouTube",
};

export const obtenerInstitucion = cache(async (): Promise<DatosInstitucion> => {
  if (compilando()) return { ...organismo, redes: redesSociales, atencion: ATENCION_RESPALDO };
  try {
    const i = await (await cms()).findGlobal({ slug: "institucion", ...publico });
    if (!i?.nombre) throw new Error("sin datos");
    return {
      ...i,
      correo: i.correo,
      redes: (i.redes ?? []).map((r) => ({ red: r.red, url: r.url, nombre: NOMBRES_RED[r.red] })),
      atencion: { ...ATENCION_RESPALDO, ...i.atencion },
    };
  } catch {
    return { ...organismo, redes: redesSociales, atencion: ATENCION_RESPALDO };
  }
});

export const obtenerMenu = cache(async (ubicacion: "principal" | "pie-informate"): Promise<EnlaceMenu[]> => {
  const respaldo = ubicacion === "principal" ? menuPrincipal : informate;
  if (compilando()) return respaldo;
  try {
    const { docs } = await (await cms()).find({
      collection: "menus",
      where: { ubicacion: { equals: ubicacion } },
      limit: 1,
      ...publico,
    });
    const elementos = docs[0]?.elementos;
    if (!elementos?.length) return respaldo;
    return elementos.map((e) => ({
      etiqueta: e.etiqueta,
      href: e.url,
      hijos: e.hijos?.length ? e.hijos.map((h) => ({ etiqueta: h.etiqueta, href: h.url })) : undefined,
    }));
  } catch {
    return respaldo;
  }
});

export const obtenerPagina = cache(async (slug: string) => {
  const { docs } = await (await cms()).find({
    collection: "paginas",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publico,
    depth: 2,
  });
  return docs[0] ?? null;
});

export const subpaginas = cache(async (slugPadre: string) => {
  const padre = await obtenerPagina(slugPadre);
  if (!padre) return [];
  const { docs } = await (await cms()).find({
    collection: "paginas",
    where: { padre: { equals: padre.id } },
    sort: "createdAt",
    limit: 50,
    ...publico,
  });
  return docs;
});

export const POR_PAGINA_NOTICIAS = 9;

export const listarNoticias = cache(async (pagina = 1, limite = POR_PAGINA_NOTICIAS) =>
  (await cms()).find({ collection: "noticias", sort: "-fecha", page: pagina, limit: limite, ...publico }),
);

export const obtenerNoticia = cache(async (slug: string) => {
  const { docs } = await (await cms()).find({
    collection: "noticias",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publico,
    depth: 2,
  });
  return docs[0] ?? null;
});

export const listarServicios = cache(async (soloDestacados = false) => {
  const where: Where | undefined = soloDestacados ? { destacado: { equals: true } } : undefined;
  return (await (await cms()).find({ collection: "servicios", where, sort: "nombre", limit: 100, ...publico })).docs;
});

export const obtenerServicio = cache(async (slug: string) => {
  const { docs } = await (await cms()).find({
    collection: "servicios",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publico,
  });
  return docs[0] ?? null;
});

export const listarBanners = cache(async () =>
  (await (await cms()).find({ collection: "banners", sort: "orden", limit: 6, ...publico })).docs,
);

export const listarPreguntas = cache(async () =>
  (await (await cms()).find({ collection: "preguntas-frecuentes", sort: "orden", limit: 200, ...publico })).docs,
);

export const documentosMarcoLegal = cache(async () =>
  (
    await (await cms()).find({
      collection: "documentos",
      where: { seccion: { equals: "marco-legal" } },
      sort: "-fechaCreacion",
      limit: 500,
      ...publico,
    })
  ).docs,
);

/** Payload entrega URL absolutas (serverURL); el portal usa rutas propias para el optimizador de imágenes. */
function rutaPropia<T extends string | null | undefined>(url: T): T {
  if (!url) return url;
  try {
    const u = new URL(url);
    return (u.pathname.startsWith("/api/") ? u.pathname + u.search : url) as T;
  } catch {
    return url;
  }
}

/** Imagen relacionada ya poblada (depth ≥ 1), con rutas propias, o null. */
export function comoMedio(valor: unknown): Medio | null {
  if (!valor || typeof valor !== "object" || !("url" in valor)) return null;
  const m = valor as Medio;
  const sizes = Object.fromEntries(
    Object.entries(m.sizes ?? {}).map(([k, v]) => [k, v ? { ...v, url: rutaPropia(v.url) } : v]),
  ) as Medio["sizes"];
  return { ...m, url: rutaPropia(m.url), sizes };
}

/** Documentos de transparencia de una sección o subsección (A2 4.03). */
export const documentosTransparencia = cache(async (destino: string) =>
  (
    await (await cms()).find({
      collection: "documentos",
      where: { area: { equals: "transparencia" }, seccionTransparencia: { equals: destino } },
      sort: ["-anio", "-fechaCreacion"],
      limit: 1000,
      ...publico,
    })
  ).docs,
);

/** Cantidad de documentos por sección de transparencia, para los menús de archivos. */
export const conteoTransparencia = cache(async (): Promise<Map<string, number>> => {
  const { docs } = await (await cms()).find({
    collection: "documentos",
    where: { area: { equals: "transparencia" } },
    select: { seccionTransparencia: true },
    pagination: false,
    ...publico,
    depth: 0,
  });
  const conteo = new Map<string, number>();
  for (const d of docs) if (d.seccionTransparencia) conteo.set(d.seccionTransparencia, (conteo.get(d.seccionTransparencia) ?? 0) + 1);
  return conteo;
});

export const recientesTransparencia = cache(async (limite = 5) =>
  (
    await (await cms()).find({
      collection: "documentos",
      where: { area: { equals: "transparencia" } },
      sort: "-createdAt",
      limit: limite,
      ...publico,
    })
  ).docs,
);

export const textoTransparencia = cache(async (seccion: string) => {
  const { docs } = await (await cms()).find({
    collection: "textos-transparencia",
    where: { seccion: { equals: seccion } },
    limit: 1,
    ...publico,
  });
  return docs[0] ?? null;
});
