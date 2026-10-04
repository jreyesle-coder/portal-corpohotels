/**
 * S5 — Extractor del contenido de los dos Joomla actuales (portal institucional con K2 y portal de
 * transparencia con Phoca Download). Recorre el sitio público, como lo ve la ciudadanía, desde los
 * menús y desde la lista de URL indexadas (migracion/datos/urls-indexadas.txt). No se tiene acceso
 * a la base de datos del Joomla (novedad N-30): lo no publicado no se migra.
 *
 * Salida: migracion/datos/inventario.json. El HTML descargado queda en migracion/cache/ para que una
 * nueva ejecución (por ejemplo, la del corte en S9) solo vuelva a pedir lo necesario.
 * Uso: npm run migracion:rastrear [-- --sin-cache]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import {
  ARCHIVO_INVENTARIO,
  ARCHIVO_URLS_INDEXADAS,
  type ArchivoPhoca,
  type CategoriaPhoca,
  DIR_CACHE,
  HOST,
  type Inventario,
  normalizarUrl,
  type PaginaAnterior,
} from "./comun";
import { instalacion } from "../../src/migracion/redireccion";

const SIN_CACHE = process.argv.includes("--sin-cache");
const CONCURRENCIA = 4;
const PAUSA_MS = 150;
const AGENTE = "Portal CORPHOTELS - migracion de contenido (TIC)";

/** Lo que no se recorre: perfiles de usuario de K2 (exponen nombres de usuario), variantes de impresión y fuentes. */
const OMITIR = [
  /\/component\/mailto/,
  /\/foro\/user/,
  /\/itemlist\/user\//,
  /csrf\.token|system\.paths/,
  /\/component\/users/,
  /[?&](format|tmpl|print)=/,
  /[?&]download=/,
  /\/administrator/,
];

function dentroDelSitio(ruta: string) {
  return (
    ruta === "/" ||
    ruta === "/transparencia/" ||
    ruta.startsWith("/index.php") ||
    ruta.startsWith("/transparencia/index.php")
  );
}

const dirHtml = path.join(DIR_CACHE, "html");
mkdirSync(dirHtml, { recursive: true });

async function obtener(ruta: string): Promise<{ estado: number; html: string; final: string }> {
  const clave = createHash("sha1").update(ruta).digest("hex");
  const archivo = path.join(dirHtml, `${clave}.json`);
  if (!SIN_CACHE && existsSync(archivo)) return JSON.parse(readFileSync(archivo, "utf8"));
  for (let intento = 1; ; intento++) {
    try {
      const r = await fetch(HOST + ruta, { headers: { "User-Agent": AGENTE }, redirect: "follow", signal: AbortSignal.timeout(60_000) });
      const html = (r.headers.get("content-type") ?? "").includes("html") ? await r.text() : "";
      const resultado = { estado: r.status, html, final: normalizarUrl(r.url) ?? ruta };
      // Los errores temporales del servidor (5xx, 429) no se guardan: se reintentan en la próxima corrida.
      if (r.status < 500 && r.status !== 429) writeFileSync(archivo, JSON.stringify(resultado));
      await new Promise((ok) => setTimeout(ok, PAUSA_MS));
      return resultado;
    } catch (e) {
      if (intento >= 3) return { estado: 0, html: "", final: ruta };
      console.warn(`Reintento ${intento} de ${ruta}: ${(e as Error).message}`);
      await new Promise((ok) => setTimeout(ok, 2000 * intento));
    }
  }
}

const texto = (n: Element | null | undefined) => (n?.textContent ?? "").replace(/\s+/g, " ").trim();

/** Cuerpo de la página sin menús, herramientas ni decoraciones de la plantilla. */
function contenidoPrincipal(doc: Document): Element | null {
  const main = doc.querySelector("main") ?? doc.body;
  const copia = main.cloneNode(true) as Element;
  copia
    .querySelectorAll(
      ".la-menu, .control, .miga, script, style, form, svg, .cover, .los-folders, .attachment__container, .file__container, .comentarios, .adobe, .pd-cb, .pgcenter, noscript, iframe[src*='addthis']",
    )
    .forEach((n) => n.remove());
  copia.querySelector("h1")?.remove();
  return copia;
}

function enlacesInternos(doc: Document, base: string): string[] {
  const salida = new Set<string>();
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href")!;
    if (/^(mailto|tel|javascript):|^#/.test(href)) return;
    let absoluta: URL;
    try {
      absoluta = new URL(href, HOST + base);
    } catch {
      return;
    }
    const n = normalizarUrl(absoluta.href);
    if (n && dentroDelSitio(n.split("?")[0]) && !OMITIR.some((r) => r.test(n))) salida.add(n);
  });
  return [...salida];
}

/** Archivos de Phoca Download listados en una categoría. */
function archivosPhoca(doc: Document, categoria: number | null, rutaCategoria: string): ArchivoPhoca[] {
  const salida: ArchivoPhoca[] = [];
  doc.querySelectorAll(".attachment__container_item, .file__container_item").forEach((item) => {
    const boton = item.querySelector("a[href*='download=']");
    if (!boton) return;
    const href = boton.getAttribute("href")!;
    const m = /download=(\d+)(?::([^&"]*))?/.exec(href);
    if (!m) return;
    const info = item.querySelector("a.info")?.getAttribute("onmouseover") ?? "";
    // Tamaño y fecha vienen en el globo de información (HTML escapado dentro de un atributo).
    const valores = [...info.replace(/&lt;/g, "<").replace(/&gt;/g, ">").matchAll(/class=\\?'pd-fl-m\\?'>([^<]*)</g)].map((m) => m[1].trim());
    salida.push({
      id: Number(m[1]),
      alias: m[2] ?? "",
      titulo: texto(item.querySelector(".the-caption .title, .title")),
      archivo: item.querySelector("[alt]")?.getAttribute("alt") ?? "",
      tamano: valores[0] ?? "",
      fecha: valores[1] ?? "",
      sitio: instalacion(rutaCategoria),
      categoria,
      rutaCategoria,
      urlDescarga: normalizarUrl(new URL(href, HOST).href) ?? href,
    });
  });
  return salida;
}

function clasificar(ruta: string, doc: Document): PaginaAnterior["tipo"] {
  if (doc.querySelector(".pd-category, #phoca-dl-category-box")) return "phoca";
  if (/\/item\/\d+/.test(ruta) || doc.querySelector(".itemFullText")) return "k2-item";
  if (/itemlist|\/noticias(\?|$)/.test(ruta) || doc.querySelector(".itemList, .catItemView")) return "k2-lista";
  return "articulo";
}

// --- Recorrido ---------------------------------------------------------------------------------

const semillas = new Set<string>(["/index.php", "/transparencia/index.php", "/index.php/noticias", "/"]);
if (existsSync(ARCHIVO_URLS_INDEXADAS)) {
  for (const linea of readFileSync(ARCHIVO_URLS_INDEXADAS, "utf8").split(/\r?\n/)) {
    const [url, , tipo] = linea.split(" ");
    if (!url || (tipo && !tipo.includes("html"))) continue;
    const n = normalizarUrl(url);
    if (n && dentroDelSitio(n.split("?")[0]) && !OMITIR.some((r) => r.test(n))) semillas.add(n);
  }
}

const pendientes = [...semillas];
const vistas = new Set<string>(pendientes);
const paginas: PaginaAnterior[] = [];
// Clave «sitio:id»: el portal y transparencia son dos Joomla y sus números de Phoca se repiten.
const archivos = new Map<string, ArchivoPhoca>();
const categoriasVistas = new Set<string>();
const ventana = new JSDOM("");
const categorias = new Map<string, CategoriaPhoca>();

async function procesar(ruta: string) {
  // Las categorías de Phoca se piden completas (sin paginar).
  const esCategoria = /\/category\/(\d+)/.exec(ruta);
  // Una misma carpeta se alcanza desde el menú de escritorio y el móvil: se recorre una sola vez.
  if (esCategoria) {
    const clave = `${instalacion(ruta)}:${esCategoria[1]}`;
    if (categoriasVistas.has(clave)) return;
    categoriasVistas.add(clave);
  }
  const pedir = esCategoria && !/[?&]limit=/.test(ruta) ? `${ruta}${ruta.includes("?") ? "&" : "?"}limit=0` : ruta;
  const { estado, html, final } = await obtener(pedir);
  if (!html) {
    paginas.push({ url: ruta, estado, final, tipo: "otro", titulo: "", html: "", enlaces: [] });
    return;
  }
  // Una sola ventana de JSDOM para todas las páginas (crear una por página agota la memoria), sin
  // hojas de estilo ni scripts. El procesamiento es síncrono, así que los trabajadores no se cruzan.
  const doc = ventana.window.document;
  doc.documentElement.innerHTML = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "");
  procesarDocumento(ruta, esCategoria, estado, final, doc);
}

function procesarDocumento(ruta: string, esCategoria: RegExpExecArray | null, estado: number, final: string, doc: Document) {
  const tipo = clasificar(ruta, doc);
  const titulo = texto(doc.querySelector("h1.the_title, h1"));
  const cuerpo = contenidoPrincipal(doc);
  const enlaces = enlacesInternos(doc, ruta);
  const pagina: PaginaAnterior = {
    url: ruta,
    estado,
    final,
    tipo,
    titulo,
    html: cuerpo?.innerHTML.trim() ?? "",
    enlaces: enlaces.filter((e) => !/\/category\/\d+/.test(e) || !e.startsWith(ruta.split("?")[0])),
  };
  if (tipo === "k2-item") {
    pagina.fecha = texto(doc.querySelector(".date"));
    pagina.imagen = doc.querySelector(".itemImage img, img[src*='/media/k2/items/']")?.getAttribute("src") ?? undefined;
    pagina.html = doc.querySelector(".itemFullText")?.innerHTML.trim() ?? pagina.html;
  }
  if (tipo === "phoca") {
    const id = esCategoria ? Number(esCategoria[1]) : null;
    const rutaBase = ruta.split("?")[0];
    const descripcion = doc.querySelector(".pd-cdesc")?.innerHTML.trim() ?? "";
    const hijas = [...doc.querySelectorAll(".los-folders a[href]")].map((a) => ({
      id: Number(/\/category\/(\d+)/.exec(a.getAttribute("href")!)?.[1] ?? 0),
      titulo: texto(a.querySelector(".title")) || texto(a),
      ruta: normalizarUrl(new URL(a.getAttribute("href")!, HOST).href)!,
    }));
    pagina.html = descripcion;
    pagina.categoria = id;
    const sitio = instalacion(rutaBase);
    const clave = id === null ? `${sitio}:menu:${rutaBase}` : `${sitio}:${id}`;
    if (!categorias.has(clave)) categorias.set(clave, { sitio, id, titulo, ruta: rutaBase, hijas: hijas.map((h) => h.id), menu: id === null });
    for (const a of archivosPhoca(doc, id, rutaBase)) if (!archivos.has(`${sitio}:${a.id}`)) archivos.set(`${sitio}:${a.id}`, { ...a, sitio });
    for (const h of hijas) {
      if (vistas.has(h.ruta)) continue;
      vistas.add(h.ruta);
      pendientes.push(h.ruta);
    }
  }
  paginas.push(pagina);
  for (const e of enlaces) {
    if (!vistas.has(e)) {
      vistas.add(e);
      pendientes.push(e);
    }
  }
}

let hechas = 0;
async function trabajador() {
  while (pendientes.length) {
    const ruta = pendientes.shift()!;
    try {
      await procesar(ruta);
    } catch (e) {
      console.warn(`Error en ${ruta}: ${(e as Error).message}`);
      paginas.push({ url: ruta, estado: -1, final: ruta, tipo: "otro", titulo: "", html: "", enlaces: [] });
    }
    // Con la caché todo es síncrono: ceder el turno deja que JSDOM libere lo que tiene pendiente.
    await new Promise((ok) => setImmediate(ok));
    if (++hechas % 250 === 0) {
      const mb = Math.round(process.memoryUsage().heapUsed / 1e6);
      console.log(`${hechas} páginas, ${archivos.size} archivos, ${pendientes.length} en cola (${mb} MB)`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCIA }, trabajador));

const inventario: Inventario = {
  generado: new Date().toISOString(),
  fuente: HOST,
  paginas: paginas.sort((a, b) => a.url.localeCompare(b.url)),
  categorias: [...categorias.values()].sort((a, b) => (a.ruta + a.id).localeCompare(b.ruta + b.id)),
  archivos: [...archivos.values()].sort((a, b) => a.sitio.localeCompare(b.sitio) || a.id - b.id),
};
mkdirSync(path.dirname(ARCHIVO_INVENTARIO), { recursive: true });
writeFileSync(ARCHIVO_INVENTARIO, JSON.stringify(inventario, null, 1));
console.log(`Listo: ${paginas.length} páginas, ${categorias.size} categorías, ${archivos.size} archivos → ${ARCHIVO_INVENTARIO}`);
process.exit(0);
