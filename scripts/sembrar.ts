/**
 * Carga el contenido inicial del portal (S2) en el CMS a partir de semillas/portal-actual.json,
 * extraído del portal Joomla actual. Es idempotente: se puede ejecutar varias veces sin duplicar.
 * Uso: npm run sembrar   (requiere PostgreSQL y Azurite de Docker Compose)
 *
 * La migración completa del Joomla (todas las noticias, documentos y redirecciones 301) es S5.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import { getPayload, type CollectionSlug, type Payload } from "payload";
import { menuPrincipal, informate } from "../src/contenido/sitio";

type Imagen = { url: string; alt: string };
type Ficha = {
  requisitos: string[];
  procedimiento: string[];
  [campo: string]: unknown;
};
type Semilla = {
  fuente: string;
  institucion: Record<string, unknown>;
  sobreNosotros: { titulo: string; html: string };
  marcoLegal: { titulo: string; html: string };
  transparencia: { titulo: string; html: string };
  paginas: { slug: string; titulo: string; padre: string | null; html: string; fuente: string; imagen: Imagen | null; documentos: string[] }[];
  documentos: { clave: string; titulo: string; descripcion: string; seccion: string; tipoNorma?: string; url: string }[];
  servicios: { slug: string; nombre: string; resumen: string; html: string; fuente: string; ficha?: Ficha }[];
  noticias: { titulo: string; fecha: string; lugar: string; imagen: Imagen | null; html: string; resumen: string; fuente: string }[];
  preguntas: { pregunta: string; html: string }[];
  banners: { titulo: string; descripcion: string; imagen: Imagen; enlace: string; textoEnlace: string }[];
};

const semilla: Semilla = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../semillas/portal-actual.json"), "utf8"),
);

const payload: Payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.default({ config: payload.config });
const lexical = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM });
const sistema = { overrideAccess: true, depth: 0 } as const;

async function buscar(collection: CollectionSlug, campo: string, valor: string) {
  const r = await payload.find({ collection, where: { [campo]: { equals: valor } }, limit: 1, ...sistema, draft: true });
  return r.docs[0] as { id: number } | undefined;
}

async function guardar(
  collection: CollectionSlug,
  campo: string,
  valor: string,
  data: Record<string, unknown>,
  publicar = true,
) {
  const existente = await buscar(collection, campo, valor);
  if (!publicar) {
    // Un borrador incompleto solo se admite con draft: true; si estaba publicado, se recrea para
    // que deje de estar visible en el portal.
    if (existente) await payload.delete({ collection, id: existente.id, ...sistema });
    const doc = await payload.create({ collection, data: { ...data, _status: "draft" } as never, draft: true, ...sistema });
    return doc as unknown as { id: number };
  }
  const datos = { ...data, _status: "published" };
  const doc = existente
    ? await payload.update({ collection, id: existente.id, data: datos as never, ...sistema })
    : await payload.create({ collection, data: datos as never, ...sistema });
  return doc as unknown as { id: number };
}

async function descargar(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": "Portal CORPHOTELS - carga inicial" } });
  if (!r.ok) throw new Error(`No se pudo descargar ${url}: ${r.status}`);
  const tipo = r.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  const disposicion = r.headers.get("content-disposition") ?? "";
  const nombre = /filename="?([^";]+)"?/.exec(disposicion)?.[1] ?? decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "archivo");
  return { data: Buffer.from(await r.arrayBuffer()), mimetype: tipo, name: nombre };
}

async function imagen(img: Imagen | null) {
  if (!img) return undefined;
  const existente = await buscar("medios", "alt", img.alt);
  if (existente) return existente.id;
  const archivo = await descargar(img.url);
  const doc = await payload.create({ collection: "medios", data: { alt: img.alt }, file: { ...archivo, size: archivo.data.length }, ...sistema });
  return doc.id;
}

console.log(`Fuente: ${semilla.fuente}`);

// Datos institucionales y menús.
await payload.updateGlobal({ slug: "institucion", data: semilla.institucion as never, ...sistema });
const aElemento = (e: { etiqueta: string; href: string; hijos?: { etiqueta: string; href: string }[] }) => ({
  etiqueta: e.etiqueta,
  url: e.href,
  hijos: e.hijos?.map((h) => ({ etiqueta: h.etiqueta, url: h.href })) ?? [],
});
for (const [ubicacion, nombre, elementos] of [
  ["principal", "Menú principal", menuPrincipal],
  ["pie-informate", "Pie: Infórmate", informate],
] as const) {
  const existente = await buscar("menus", "ubicacion", ubicacion);
  const data = { nombre, ubicacion, elementos: elementos.map(aElemento) };
  if (existente) await payload.update({ collection: "menus", id: existente.id, data, ...sistema });
  else await payload.create({ collection: "menus", data, ...sistema });
}
console.log("✓ Datos institucionales y menús");

// Documentos (marco legal y organigrama).
const documentos = new Map<string, number>();
for (const d of semilla.documentos) {
  let doc = await buscar("documentos", "titulo", d.titulo);
  if (!doc) {
    const archivo = await descargar(d.url);
    doc = await payload.create({
      collection: "documentos",
      data: { titulo: d.titulo, descripcion: d.descripcion, area: "institucional", seccion: d.seccion, tipoNorma: d.tipoNorma } as never,
      file: { ...archivo, size: archivo.data.length },
      ...sistema,
    });
  }
  documentos.set(d.clave, doc.id);
}
console.log(`✓ ${documentos.size} documentos`);

// Páginas.
const sobreNosotros = await guardar("paginas", "slug", "sobre-nosotros", {
  titulo: semilla.sobreNosotros.titulo,
  slug: "sobre-nosotros",
  contenido: lexical(semilla.sobreNosotros.html),
});
await guardar("paginas", "slug", "marco-legal", {
  titulo: semilla.marcoLegal.titulo,
  slug: "marco-legal",
  padre: sobreNosotros.id,
  contenido: lexical(semilla.marcoLegal.html),
});
await guardar("paginas", "slug", "transparencia", {
  titulo: semilla.transparencia.titulo,
  slug: "transparencia",
  contenido: lexical(semilla.transparencia.html),
});
for (const p of semilla.paginas) {
  await guardar("paginas", "slug", p.slug, {
    titulo: p.titulo,
    slug: p.slug,
    padre: p.padre ? sobreNosotros.id : null,
    imagen: await imagen(p.imagen),
    contenido: lexical(p.html),
    documentos: p.documentos.map((c) => documentos.get(c)).filter(Boolean),
  });
}
console.log(`✓ ${semilla.paginas.length + 3} páginas`);

// Se publican todos con la información del portal actual (decisión de TIC); los que no tienen la
// ficha A5 completa quedan marcados en el CMS y se completan antes de producción (novedad N-20).
for (const s of semilla.servicios) {
  const ficha = s.ficha
    ? {
        ...s.ficha,
        requisitos: s.ficha.requisitos.map((texto) => ({ texto })),
        procedimiento: s.ficha.procedimiento.map((texto) => ({ texto })),
      }
    : {};
  await guardar(
    "servicios",
    "slug",
    s.slug,
    { nombre: s.nombre, slug: s.slug, resumen: s.resumen, contenido: lexical(s.html), destacado: true, ...ficha },
  );
}
console.log(`✓ ${semilla.servicios.length} servicios publicados (${semilla.servicios.filter((s) => s.ficha).length} con ficha A5 completa)`);

for (const n of semilla.noticias) {
  await guardar("noticias", "titulo", n.titulo, {
    titulo: n.titulo,
    fecha: n.fecha,
    lugar: n.lugar,
    imagen: await imagen(n.imagen),
    resumen: n.resumen,
    contenido: lexical(n.html),
    fuente: { nombre: "CORPHOTELS", url: "" },
  });
}
console.log(`✓ ${semilla.noticias.length} noticias`);

for (const [i, q] of semilla.preguntas.entries()) {
  await guardar("preguntas-frecuentes", "pregunta", q.pregunta, { pregunta: q.pregunta, respuesta: lexical(q.html), orden: i + 1 });
}
console.log(`✓ ${semilla.preguntas.length} preguntas frecuentes`);

for (const [i, b] of semilla.banners.entries()) {
  await guardar("banners", "titulo", b.titulo, {
    titulo: b.titulo,
    descripcion: b.descripcion,
    imagen: await imagen(b.imagen),
    enlace: b.enlace,
    textoEnlace: b.textoEnlace,
    orden: i + 1,
  });
}
console.log(`✓ ${semilla.banners.length} banners`);

process.exit(0);
