/**
 * S5 — Carga en el CMS el contenido extraído por `migracion:rastrear` y genera la tabla de
 * redirecciones 301. Es repetible: lo ya migrado (por su origen) no se duplica, así que en el corte
 * (S9) solo entra lo publicado después. Los archivos descargados quedan en migracion/cache/archivos.
 *
 * Salidas: documentos, textos de transparencia, noticias e imágenes en el CMS; tabla
 * «redirecciones»; migracion/datos/resultado.json para el informe (`migracion:informe`).
 * Uso: npm run migracion:importar   (requiere PostgreSQL y Azurite de Docker Compose)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import pg from "pg";
import { getPayload } from "payload";
import { TIPOS_DOCUMENTO } from "../../src/cms/archivos";
import { registrarEvento } from "../../src/cms/bitacora";
import { buscarDestino, buscarSeccion, RUTA_TRANSPARENCIA } from "../../src/contenido/transparencia";
import {
  ARCHIVO_INVENTARIO,
  type ArchivoPhoca,
  type CategoriaPhoca,
  DIR_CACHE,
  DIR_MIGRACION,
  HOST,
  type Inventario,
  type PaginaAnterior,
} from "./comun";
import { type Equivalencia, MAPA_PORTAL, MAPA_TRANSPARENCIA, SERVICIOS_K2 } from "./mapas";
import { refrescarIndiceAhora } from "../../src/busqueda/refrescar";

const inventario: Inventario = JSON.parse(readFileSync(ARCHIVO_INVENTARIO, "utf8"));
const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.default({ config: payload.config });
/**
 * Las imágenes dentro del texto apuntan a archivos del Joomla que no están en el CMS: se quitan
 * (las noticias conservan su foto principal) y el informe las cuenta.
 */
let imagenesQuitadas = 0;
const lexical = (html: string) =>
  convertHTMLToLexical({
    editorConfig,
    html: html.replace(/<img\b[^>]*>/gi, () => (imagenesQuitadas++, "")),
    JSDOM,
  });
const sistema = { overrideAccess: true, depth: 0 } as const;
const AGENTE = "Portal CORPHOTELS - migracion de contenido (TIC)";

/** Resultado para el informe: qué entró, qué no y por qué, y hallazgos heredados. */
const resultado = {
  generado: new Date().toISOString(),
  documentos: { nuevos: 0, existentes: 0, omitidos: [] as { id: string; titulo: string; motivo: string }[] },
  textos: { nuevos: 0, existentes: 0 },
  noticias: { nuevas: 0, existentes: 0, sinLugar: [] as string[], sinImagen: [] as string[], imagenesEnTexto: 0 },
  equivalenciasARevisar: [] as { anterior: string; destino: string; motivo: string; documentos: number }[],
  sinEquivalente: [] as { url: string; titulo: string; tipo: string }[],
  hallazgos: {
    titulosEnMayusculas: 0,
    sinDescripcion: 0,
    titulosRepetidos: [] as { titulo: string; veces: number; destino: string }[],
    textoConMarcasDeHerramientas: [] as string[],
    enlacesRotos: [] as { pagina: string; enlace: string; estado: number }[],
  },
  equivalencias: [] as { anterior: string; id: string; nueva: string; tipo: string }[],
};

// --- Utilidades --------------------------------------------------------------------------------

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «16 Enero 2026», «Viernes, 14 Noviembre 2025» → ISO al mediodía (sin desfase de zona). */
function fechaEs(texto: string | undefined): string | null {
  const m = /(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(\d{4})/i.exec(texto ?? "");
  if (!m) return null;
  const mes = MESES.indexOf(m[2].toLowerCase().replace("setiembre", "septiembre"));
  if (mes < 0) return null;
  return new Date(Date.UTC(Number(m[3]), mes, Number(m[1]), 12)).toISOString();
}

const anioDe = (texto: string) => /\b(19[89]\d|20[0-4]\d)\b/.exec(texto)?.[1];

function periodoDe(texto: string): string | null {
  const t = texto.toLowerCase();
  const trimestres: [RegExp, string][] = [
    [/(primer|1er|1ro|i)\s+trimestre|enero\s*[-–a]+\s*marzo|\bt-?1\b/, "t1"],
    [/(segundo|2do|ii)\s+trimestre|abril\s*[-–a]+\s*junio|\bt-?2\b/, "t2"],
    [/(tercer|3er|iii)\s+trimestre|julio\s*[-–a]+\s*septiembre|\bt-?3\b/, "t3"],
    [/(cuarto|4to|iv)\s+trimestre|octubre\s*[-–a]+\s*diciembre|\bt-?4\b/, "t4"],
  ];
  for (const [patron, valor] of trimestres) if (patron.test(t)) return valor;
  const mes = MESES.findIndex((m) => new RegExp(`\\b${m}\\b`).test(t.replace("setiembre", "septiembre")));
  if (mes >= 0) return `m${String(mes + 1).padStart(2, "0")}`;
  if (/\banual\b/.test(t)) return "anual";
  return null;
}

const TIPO_POR_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  csv: "text/csv",
  json: "application/json",
  xml: "application/xml",
  zip: "application/zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

const dirArchivos = path.join(DIR_CACHE, "archivos");
mkdirSync(dirArchivos, { recursive: true });

/** Descarga (o toma de la caché) un archivo del portal anterior. */
async function descargar(ruta: string, clave: string): Promise<{ data: Buffer; nombre: string; estado: number } | null> {
  const meta = path.join(dirArchivos, `${clave}.json`);
  const bin = path.join(dirArchivos, `${clave}.bin`);
  if (existsSync(meta)) {
    const m = JSON.parse(readFileSync(meta, "utf8"));
    return m.estado === 200 ? { data: readFileSync(bin), nombre: m.nombre, estado: 200 } : { data: Buffer.alloc(0), nombre: "", estado: m.estado };
  }
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(HOST + ruta, { headers: { "User-Agent": AGENTE }, signal: AbortSignal.timeout(180_000) });
      const disposicion = r.headers.get("content-disposition") ?? "";
      const nombre = decodeURIComponent(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicion)?.[1] ?? path.basename(new URL(r.url).pathname));
      const esHtml = (r.headers.get("content-type") ?? "").includes("text/html");
      const estado = r.ok && !esHtml ? 200 : r.ok ? 404 : r.status;
      const data = estado === 200 ? Buffer.from(await r.arrayBuffer()) : Buffer.alloc(0);
      if (estado === 200) writeFileSync(bin, data);
      writeFileSync(meta, JSON.stringify({ nombre, estado }));
      return { data, nombre, estado };
    } catch (e) {
      if (intento === 3) {
        console.warn(`No se pudo descargar ${ruta}: ${(e as Error).message}`);
        return null;
      }
      await new Promise((ok) => setTimeout(ok, 3000 * intento));
    }
  }
  return null;
}

async function porOrigen(collection: "documentos" | "noticias" | "medios", id: string) {
  const r = await payload.find({ collection, where: { "origen.identificador": { equals: id } }, limit: 1, ...sistema, ...(collection === "noticias" ? { draft: true } : {}) });
  return r.docs[0] as unknown as { id: number; filename?: string; url?: string; slug?: string; _status?: string } | undefined;
}

/** Ejecuta tareas con concurrencia limitada. */
async function enParalelo<T>(elementos: T[], n: number, tarea: (e: T, i: number) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < elementos.length) {
        const k = i++;
        await tarea(elementos[k], k);
      }
    }),
  );
}

const rutaArchivo = (filename: string) => `/api/documentos/file/${encodeURIComponent(filename)}`;
const rutaMedio = (filename: string) => `/api/medios/file/${encodeURIComponent(filename)}`;

// --- Redirecciones -----------------------------------------------------------------------------

type Fila = { origen: string; destino: string; tipo: "exacta" | "prefijo" | "identificador"; nota: string };
const redirecciones = new Map<string, Fila>();
function redirigir(origen: string, destino: string, tipo: Fila["tipo"], nota: string) {
  if (!redirecciones.has(origen)) redirecciones.set(origen, { origen, destino, tipo, nota });
}

// --- Transparencia: estructura del menú anterior -----------------------------------------------

const categorias = new Map<string, CategoriaPhoca>();
const padre = new Map<string, string>();
for (const c of inventario.categorias) {
  const clave = c.id === null ? `${c.sitio}:menu:${c.ruta}` : `${c.sitio}:${c.id}`;
  categorias.set(clave, c);
}
for (const [clave, c] of categorias) for (const h of c.hijas) if (!padre.has(`${c.sitio}:${h}`)) padre.set(`${c.sitio}:${h}`, clave);

/** Ruta del menú anterior («presupuesto/ejecucion-del-presupuesto») de una URL de transparencia. */
const rutaMenu = (url: string) =>
  url
    .split("?")[0]
    .replace(/^\/transparencia\/index\.php\/?/, "")
    .split("/category/")[0]
    .replace(/\/$/, "");

function equivalencia(url: string): (Equivalencia & { clave: string }) | null {
  let clave = rutaMenu(url);
  while (clave) {
    if (MAPA_TRANSPARENCIA[clave]) return { ...MAPA_TRANSPARENCIA[clave], clave };
    clave = clave.includes("/") ? clave.slice(0, clave.lastIndexOf("/")) : "";
  }
  return null;
}

/** Ruta nueva de un destino de transparencia (sección o subsección). */
function rutaDestino(destino: string) {
  return buscarDestino(destino)?.ruta ?? (buscarSeccion(destino) ? `${RUTA_TRANSPARENCIA}/${destino}` : RUTA_TRANSPARENCIA);
}

/** Cadena de categorías de un archivo, de la más profunda a la raíz. */
function cadena(sitio: string, categoria: number | null): CategoriaPhoca[] {
  const salida: CategoriaPhoca[] = [];
  let clave: string | undefined = categoria === null ? undefined : `${sitio}:${categoria}`;
  const vistas = new Set<string>();
  while (clave && categorias.has(clave) && !vistas.has(clave)) {
    vistas.add(clave);
    salida.push(categorias.get(clave)!);
    clave = padre.get(clave);
  }
  return salida;
}

for (const [clave, eq] of Object.entries(MAPA_TRANSPARENCIA)) {
  redirigir(`/transparencia/index.php/${clave}`, rutaDestino(eq.destino), "prefijo", "Menú de transparencia anterior");
}
redirigir("/transparencia/index.php", RUTA_TRANSPARENCIA, "prefijo", "Inicio y páginas internas de Joomla sin equivalente propio");
redirigir("/transparencia/", RUTA_TRANSPARENCIA, "exacta", "Inicio de transparencia");
redirigir("/transparencia/index.php/resultado-de-busqueda", "/buscar", "prefijo", "Buscador del portal de transparencia anterior");
// Rutas directas a la carpeta de archivos de Phoca: el documento migrado está en su sección.
redirigir("/transparencia/phocadownload", RUTA_TRANSPARENCIA, "prefijo", "Ruta directa a un archivo del portal de transparencia anterior");

// --- Transparencia: documentos -----------------------------------------------------------------

const archivosTransparencia = inventario.archivos.filter((a) => a.sitio === "transparencia");
const conteoRevisar = new Map<string, number>();
const titulosPorDestino = new Map<string, number>();
let hechos = 0;

async function importarArchivo(a: ArchivoPhoca) {
  const idOrigen = `phoca:transparencia:${a.id}`;
  const eq = equivalencia(a.rutaCategoria);
  if (!eq) {
    resultado.documentos.omitidos.push({ id: idOrigen, titulo: a.titulo, motivo: `Sin equivalencia para el menú «${rutaMenu(a.rutaCategoria)}»` });
    return;
  }
  const destino = buscarDestino(eq.destino) ? eq.destino : null;
  if (eq.revisar) conteoRevisar.set(eq.clave, (conteoRevisar.get(eq.clave) ?? 0) + 1);
  const existente = await porOrigen("documentos", idOrigen);
  const cadenaCat = cadena("transparencia", a.categoria);
  const nombresCat = cadenaCat.map((c) => c.titulo).reverse();
  const destinoFinal = destino ?? firstDestinoDeSeccion(eq.destino);
  const claveTitulo = `${destinoFinal}|${a.titulo.trim().toLowerCase()}`;
  titulosPorDestino.set(claveTitulo, (titulosPorDestino.get(claveTitulo) ?? 0) + 1);
  if (existente?.filename) {
    resultado.documentos.existentes++;
    redirigir(idOrigen, rutaArchivo(existente.filename), "identificador", `Descarga ${a.id} del portal de transparencia`);
    resultado.equivalencias.push({ anterior: a.urlDescarga, id: idOrigen, nueva: rutaArchivo(existente.filename), tipo: "documento" });
    return;
  }
  const archivo = await descargar(a.urlDescarga, `transparencia-${a.id}`);
  if (!archivo || archivo.estado !== 200 || archivo.data.length === 0) {
    resultado.documentos.omitidos.push({ id: idOrigen, titulo: a.titulo, motivo: `El portal anterior no entrega el archivo (estado ${archivo?.estado ?? "sin respuesta"})` });
    return;
  }
  const extension = (path.extname(archivo.nombre || a.archivo).slice(1) || "").toLowerCase();
  const mimetype = TIPO_POR_EXTENSION[extension];
  if (!mimetype || !TIPOS_DOCUMENTO.includes(mimetype)) {
    resultado.documentos.omitidos.push({ id: idOrigen, titulo: a.titulo, motivo: `Formato no admitido (.${extension || "sin extensión"})` });
    return;
  }
  const textoPeriodo = [cadenaCat[0]?.titulo ?? "", a.titulo].join(" ");
  const anio = Number(anioDe(cadenaCat[0]?.titulo ?? "") ?? anioDe(a.titulo) ?? cadenaCat.map((c) => anioDe(c.titulo)).find(Boolean) ?? fechaEs(a.fecha)?.slice(0, 4) ?? new Date().getFullYear());
  if (a.titulo === a.titulo.toUpperCase() && /[A-Z]{4}/.test(a.titulo)) resultado.hallazgos.titulosEnMayusculas++;
  resultado.hallazgos.sinDescripcion++;
  const ubicacion = [buscarDestino(destinoFinal)?.titulo ?? eq.destino, ...nombresCat.filter((n) => !/^\s*$/.test(n))].join(" › ");
  const nombreArchivo = `${path.basename(archivo.nombre || a.archivo, path.extname(archivo.nombre || a.archivo)) || a.alias || a.id}.${extension}`;
  try {
    const doc = await payload.create({
      collection: "documentos",
      data: {
        titulo: a.titulo.slice(0, 200) || `Documento ${a.id}`,
        descripcion: `Documento publicado en el portal de transparencia anterior en «${ubicacion}».`.slice(0, 500),
        fechaCreacion: fechaEs(a.fecha) ?? new Date().toISOString(),
        area: "transparencia",
        seccionTransparencia: destinoFinal,
        anio,
        periodo: periodoDe(textoPeriodo),
        origen: { url: a.urlDescarga, identificador: idOrigen },
      } as never,
      file: { data: archivo.data, mimetype, name: nombreArchivo, size: archivo.data.length },
      ...sistema,
    });
    resultado.documentos.nuevos++;
    redirigir(idOrigen, rutaArchivo((doc as { filename: string }).filename), "identificador", `Descarga ${a.id} del portal de transparencia`);
    resultado.equivalencias.push({ anterior: a.urlDescarga, id: idOrigen, nueva: rutaArchivo((doc as { filename: string }).filename), tipo: "documento" });
  } catch (e) {
    resultado.documentos.omitidos.push({ id: idOrigen, titulo: a.titulo, motivo: `El CMS lo rechazó: ${(e as Error).message.slice(0, 200)}` });
  }
  if (++hechos % 100 === 0) console.log(`  ${hechos} de ${archivosTransparencia.length} documentos`);
}

/** Si la equivalencia es una sección con subsecciones, los documentos van a su primera subsección. */
function firstDestinoDeSeccion(clave: string) {
  const s = buscarSeccion(clave);
  return s?.subsecciones?.length ? `${s.clave}/${s.subsecciones[0].clave}` : clave;
}

console.log(`Transparencia: ${archivosTransparencia.length} documentos…`);
await enParalelo(archivosTransparencia, 4, importarArchivo);

for (const [clave, n] of conteoRevisar) {
  const eq = MAPA_TRANSPARENCIA[clave];
  resultado.equivalenciasARevisar.push({ anterior: `/transparencia/index.php/${clave}`, destino: rutaDestino(eq.destino), motivo: eq.revisar!, documentos: n });
}
for (const [clave, veces] of titulosPorDestino) {
  if (veces > 1) {
    const [destino, titulo] = clave.split("|");
    resultado.hallazgos.titulosRepetidos.push({ titulo, veces, destino });
  }
}

// Carpetas de Phoca: llevan a su sección y, si es de publicación periódica, al año de la carpeta.
for (const c of inventario.categorias.filter((c) => c.sitio === "transparencia" && c.id !== null)) {
  const eq = equivalencia(c.ruta);
  if (!eq) continue;
  const destino = buscarDestino(eq.destino);
  const anio = cadena("transparencia", c.id).map((x) => anioDe(x.titulo)).find(Boolean);
  const ruta = rutaDestino(eq.destino) + (destino?.periodica && anio ? `?anio=${anio}` : "");
  redirigir(`phoca-cat:transparencia:${c.id}`, ruta, "identificador", `Carpeta «${c.titulo}» del portal de transparencia`);
  resultado.equivalencias.push({ anterior: c.ruta, id: `phoca-cat:transparencia:${c.id}`, nueva: ruta, tipo: "carpeta" });
}

// --- Transparencia: textos ---------------------------------------------------------------------

const textoPlano = (html: string) => new JSDOM(`<div>${html}</div>`).window.document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
const textosPorDestino = new Map<string, { html: string; url: string }>();
for (const p of inventario.paginas) {
  if (!p.url.startsWith("/transparencia/index.php") || p.estado !== 200 || !p.html) continue;
  if (p.tipo === "phoca" && p.categoria !== null && p.categoria !== undefined) continue; // solo la descripción de la página del menú
  const eq = equivalencia(p.url);
  if (!eq || textoPlano(p.html).length < 40) continue;
  const previo = textosPorDestino.get(eq.destino);
  if (!previo || textoPlano(p.html).length > textoPlano(previo.html).length) textosPorDestino.set(eq.destino, { html: p.html, url: p.url });
}
for (const [destino, { html }] of textosPorDestino) {
  const existe = await payload.find({ collection: "textos-transparencia", where: { seccion: { equals: destino } }, limit: 1, ...sistema });
  if (existe.docs.length) {
    resultado.textos.existentes++;
    continue;
  }
  try {
    await payload.create({ collection: "textos-transparencia", data: { seccion: destino, contenido: lexical(html) } as never, ...sistema });
    resultado.textos.nuevos++;
  } catch (e) {
    console.warn(`Texto de ${destino} no cargado: ${(e as Error).message}`);
  }
}

// --- Portal institucional ----------------------------------------------------------------------

for (const [clave, { destino }] of Object.entries(MAPA_PORTAL)) {
  redirigir(clave ? `/index.php/${clave}` : "/index.php", destino, clave ? "prefijo" : "exacta", "Menú del portal anterior");
}

// Documentos de Phoca del portal (marco legal y organigrama), cargados en S2: se enlazan por título.
const semilla = JSON.parse(readFileSync(path.resolve(DIR_MIGRACION, "../semillas/portal-actual.json"), "utf8")) as {
  documentos: { titulo: string; url: string }[];
};
for (const d of semilla.documentos) {
  const id = /download=(\d+)/.exec(d.url)?.[1];
  const doc = (await payload.find({ collection: "documentos", where: { titulo: { equals: d.titulo } }, limit: 1, ...sistema })).docs[0];
  if (!id || !doc?.filename) continue;
  if (!doc.origen?.identificador) await payload.update({ collection: "documentos", id: doc.id, data: { origen: { url: d.url.replace(HOST, ""), identificador: `phoca:portal:${id}` } } as never, ...sistema });
  redirigir(`phoca:portal:${id}`, rutaArchivo(doc.filename), "identificador", "Descarga del portal anterior");
  resultado.equivalencias.push({ anterior: d.url.replace(HOST, ""), id: `phoca:portal:${id}`, nueva: rutaArchivo(doc.filename), tipo: "documento" });
}

// Servicios de K2.
for (const [id, destino] of Object.entries(SERVICIOS_K2)) {
  redirigir(`k2:${id}`, destino, "identificador", "Servicio del portal anterior");
  resultado.equivalencias.push({ anterior: `/index.php/servicios/item/${id}`, id: `k2:${id}`, nueva: destino, tipo: "servicio" });
}

// Noticias de K2.
const noticiasK2 = inventario.paginas.filter((p) => p.tipo === "k2-item" && /\/noticias\/item\/\d+/.test(p.url) && p.estado === 200);
const vistasK2 = new Set<string>();
console.log(`Portal: ${noticiasK2.length} noticias…`);
for (const p of noticiasK2) {
  const idK2 = /\/item\/(\d+)/.exec(p.url)![1];
  if (vistasK2.has(idK2)) continue;
  vistasK2.add(idK2);
  await importarNoticia(p, idK2);
}

async function importarImagen(src: string, alt: string): Promise<number | undefined> {
  const ruta = src.startsWith("http") ? new URL(src).pathname : src.split("?")[0];
  const idOrigen = `imagen:${ruta}`;
  const existente = await porOrigen("medios", idOrigen);
  if (existente) return existente.id;
  const archivo = await descargar(ruta, `imagen-${ruta.replace(/[^a-z0-9]+/gi, "-").slice(-120)}`);
  if (!archivo || archivo.estado !== 200) return undefined;
  const extension = path.extname(ruta).slice(1).toLowerCase();
  const mimetype = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[extension];
  if (!mimetype) return undefined;
  try {
    const m = await payload.create({
      collection: "medios",
      data: { alt: alt.slice(0, 250), origen: { url: ruta, identificador: idOrigen } } as never,
      file: { data: archivo.data, mimetype, name: path.basename(ruta), size: archivo.data.length },
      ...sistema,
    });
    // Las variantes de tamaño de K2 de la misma imagen llevan a la imagen migrada.
    const base = ruta.replace(/_(XS|S|M|L|XL|Generic)\.jpg$/i, "");
    for (const t of ["XS", "S", "M", "L", "XL", "Generic"]) redirigir(`${base}_${t}.jpg`, rutaMedio((m as { filename: string }).filename), "exacta", "Imagen de noticia");
    redirigir(ruta, rutaMedio((m as { filename: string }).filename), "exacta", "Imagen del portal anterior");
    return m.id as number;
  } catch (e) {
    console.warn(`Imagen ${ruta} no cargada: ${(e as Error).message}`);
    return undefined;
  }
}

async function importarNoticia(p: PaginaAnterior, idK2: string) {
  const idOrigen = `k2:${idK2}`;
  const titulo = p.titulo.slice(0, 160);
  let existente = await porOrigen("noticias", idOrigen);
  if (!existente) {
    // Las seis noticias recientes se cargaron en S2 sin origen: se reconocen por el título.
    const porTitulo = (await payload.find({ collection: "noticias", where: { titulo: { equals: titulo } }, limit: 1, draft: true, ...sistema })).docs[0];
    if (porTitulo) {
      await payload.update({ collection: "noticias", id: porTitulo.id, data: { origen: { url: p.url, identificador: idOrigen } } as never, ...sistema });
      existente = { id: porTitulo.id as number, slug: porTitulo.slug, _status: porTitulo._status ?? undefined };
    }
  }
  if (existente) {
    resultado.noticias.existentes++;
    // Un borrador (noticia sin foto) no se publica: su URL anterior cae en el listado de noticias.
    if (existente._status === "draft") return;
    redirigir(idOrigen, `/noticias/${existente.slug}`, "identificador", "Noticia del portal anterior");
    resultado.equivalencias.push({ anterior: p.url, id: idOrigen, nueva: `/noticias/${existente.slug}`, tipo: "noticia" });
    return;
  }
  const doc = new JSDOM(`<div>${p.html}</div>`).window.document;
  const primero = doc.querySelector("p strong, p b");
  const lineaLugar = primero?.textContent?.trim() ?? "";
  const lugar = /^([^\d,–—-][^\d–—-]*?)\s*[,–—-]\s*\d{1,2}\s+de\s+[a-záéíóú]+/i.exec(lineaLugar)?.[1]?.trim().replace(/[,.]$/, "");
  if (!lugar) resultado.noticias.sinLugar.push(p.url);
  if (/\S+-\S+-\d+-…|Reporte-[\w-]+/.test(doc.body.textContent ?? "")) resultado.hallazgos.textoConMarcasDeHerramientas.push(p.url);
  const parrafos = [...doc.querySelectorAll("p")].map((n) => n.textContent?.replace(/\s+/g, " ").trim() ?? "").filter((t) => t.length > 40);
  const resumenBase = (parrafos[0] ?? titulo).replace(lineaLugar, "").trim() || titulo;
  const resumen = resumenBase.length > 300 ? `${resumenBase.slice(0, 296).replace(/\s+\S*$/, "")}…` : resumenBase;
  const imagen = p.imagen ? await importarImagen(p.imagen, titulo) : undefined;
  // La foto principal es obligatoria (A2 4.02): sin ella, la noticia queda como borrador para que
  // Comunicaciones la complete; mientras, su URL anterior lleva al listado de noticias.
  const publicar = imagen !== undefined;
  if (!publicar) resultado.noticias.sinImagen.push(p.url);
  try {
    const n = await payload.create({
      collection: "noticias",
      data: {
        titulo,
        fecha: fechaEs(p.fecha) ?? new Date().toISOString(),
        lugar: (lugar ?? "República Dominicana").slice(0, 120),
        imagen,
        resumen,
        contenido: lexical(p.html),
        fuente: { nombre: "CORPHOTELS", url: "" },
        origen: { url: p.url, identificador: idOrigen },
        _status: publicar ? "published" : "draft",
      } as never,
      ...(publicar ? {} : { draft: true }),
      ...sistema,
    });
    resultado.noticias.nuevas++;
    if (!publicar) return;
    redirigir(idOrigen, `/noticias/${(n as { slug: string }).slug}`, "identificador", "Noticia del portal anterior");
    resultado.equivalencias.push({ anterior: p.url, id: idOrigen, nueva: `/noticias/${(n as { slug: string }).slug}`, tipo: "noticia" });
  } catch (e) {
    console.warn(`Noticia ${p.url} no cargada: ${(e as Error).message}`);
    resultado.sinEquivalente.push({ url: p.url, titulo: p.titulo, tipo: `noticia rechazada: ${(e as Error).message.slice(0, 120)}` });
  }
}

// «Propiedades disponibles de inversión» no tiene lugar en la estructura de A2 4.02: se conserva como
// borrador (no publicado) hasta que Comunicaciones decida dónde va (novedad N-33).
const propiedades = inventario.paginas.find((p) => p.url === "/index.php/propiedades-disponibles-de-inversion" && p.estado === 200);
if (propiedades) {
  const existe = await payload.find({ collection: "paginas", where: { slug: { equals: "propiedades-disponibles-de-inversion" } }, limit: 1, draft: true, ...sistema });
  if (!existe.docs.length) {
    await payload.create({
      collection: "paginas",
      data: { titulo: propiedades.titulo, slug: "propiedades-disponibles-de-inversion", contenido: lexical(propiedades.html), _status: "draft" } as never,
      draft: true,
      ...sistema,
    });
  }
}

// Páginas recorridas que no quedan cubiertas por ninguna regla (para el informe).
const cubierta = (url: string) => {
  if (url.startsWith("/transparencia/")) return url === "/transparencia/" || Boolean(equivalencia(url)) || url.startsWith("/transparencia/index.php");
  const clave = url.split("?")[0].replace(/^\/index\.php\/?/, "");
  return url === "/" || [...Object.keys(MAPA_PORTAL)].some((k) => (k ? clave === k || clave.startsWith(`${k}/`) : clave === "")) || /\/item\/\d+/.test(url);
};
for (const p of inventario.paginas) {
  if (!cubierta(p.url)) resultado.sinEquivalente.push({ url: p.url, titulo: p.titulo, tipo: p.tipo });
  if (p.estado >= 400 || p.estado <= 0) resultado.hallazgos.enlacesRotos.push({ pagina: p.url, enlace: p.url, estado: p.estado });
}

// --- Guardar redirecciones ---------------------------------------------------------------------

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const filas = [...redirecciones.values()];
const cliente = await pool.connect();
try {
  await cliente.query("BEGIN");
  for (let i = 0; i < filas.length; i += 500) {
    const lote = filas.slice(i, i + 500);
    const valores = lote.map((_, k) => `($${k * 4 + 1}, $${k * 4 + 2}, $${k * 4 + 3}::enum_redirecciones_tipo, $${k * 4 + 4}, now(), now())`).join(",");
    await cliente.query(
      `INSERT INTO redirecciones (origen, destino, tipo, nota, updated_at, created_at) VALUES ${valores}
       ON CONFLICT (origen) DO UPDATE SET destino = EXCLUDED.destino, tipo = EXCLUDED.tipo, nota = EXCLUDED.nota, updated_at = now()`,
      lote.flatMap((f) => [f.origen, f.destino, f.tipo, f.nota]),
    );
  }
  await cliente.query("COMMIT");
} catch (e) {
  await cliente.query("ROLLBACK");
  throw e;
} finally {
  cliente.release();
  await pool.end();
}
await registrarEvento(payload, {
  evento: "modificacion",
  coleccion: "redirecciones",
  titulo: `Migración S5: ${filas.length} redirecciones cargadas`,
  detalle: { documentos: resultado.documentos.nuevos, noticias: resultado.noticias.nuevas },
});

resultado.noticias.imagenesEnTexto = imagenesQuitadas;
writeFileSync(path.join(DIR_MIGRACION, "datos", "resultado.json"), JSON.stringify(resultado, null, 1));
console.log(
  `Listo. Documentos: ${resultado.documentos.nuevos} nuevos, ${resultado.documentos.existentes} ya migrados, ${resultado.documentos.omitidos.length} omitidos. ` +
    `Textos: ${resultado.textos.nuevos}. Noticias: ${resultado.noticias.nuevas} nuevas, ${resultado.noticias.existentes} existentes. Redirecciones: ${filas.length}.`,
);
// El índice del buscador se refresca al terminar la carga (S6).
await refrescarIndiceAhora();
process.exit(0);
