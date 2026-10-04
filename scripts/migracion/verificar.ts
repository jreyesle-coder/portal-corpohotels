/**
 * S5 — Criterio «Listo cuando»: el 100% de las URL indexadas del portal anterior responde 301 a su
 * destino (que debe existir: 200) o tiene una justificación documentada. Prueba cada URL contra el
 * portal nuevo y escribe docs/migracion/verificacion-urls.csv. Termina con error si alguna falla.
 *
 * Fuentes: migracion/datos/urls-indexadas.txt (Internet Archive; se le puede añadir la exportación de
 * Google Search Console) y las URL recorridas por el extractor (migracion/datos/inventario.json).
 * Uso: npm run migracion:verificar [-- --base=http://localhost:3000]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARCHIVO_INVENTARIO, ARCHIVO_URLS_INDEXADAS, DIR_MIGRACION, type Inventario, normalizarUrl } from "./comun";

const BASE = process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? process.env.SITE_URL ?? "http://localhost:3000";
const SALIDA = path.resolve(DIR_MIGRACION, "../docs/migracion/verificacion-urls.csv");

/** URL que no necesitan redirección, con su justificación (se documentan en el informe). */
const JUSTIFICACIONES: [RegExp, string][] = [
  [/^\/(transparencia\/)?(templates|modules|plugins|components|libraries|cache|includes|layouts|language|bin|cli|logs|tmp)\//, "Recurso técnico de la plantilla o del sistema Joomla; no es contenido."],
  [/^\/(transparencia\/)?media\/(?!k2\/items)/, "Recurso técnico de Joomla (scripts, estilos e iconos); no es contenido."],
  [/\.(css|js|map|woff2?|ttf|eot|svg|ico)(\?|$)/i, "Recurso técnico de la plantilla anterior (estilos, scripts o fuentes); no es contenido."],
  [/^\/(transparencia\/)?administrator/, "Panel de administración de Joomla: no se publica en el portal nuevo (A2 5.02.a)."],
  [/\/foro\/user|\/itemlist\/user\/|view=user/, "Perfil o listado por autor de K2: expone nombres de usuario del Joomla (riesgo 1 de requerimientos); se retira a propósito."],
  [/\/(component\/users|registro|contrasena-olvidada|nombre-de-usuario)(\/|\?|$)/, "Registro e inicio de sesión de usuarios de Joomla: el portal nuevo no tiene cuentas públicas."],
  [/^\/index\.php\/foro(\/|\?|$)/, "Foro (Kunena) del portal anterior, fuera de servicio (respondía 503); el portal nuevo no tiene foro."],
  [/^\/(transparencia\/)?index\.php\/(.+\/)?error-404(\/|\?|$)/, "Página de error del portal anterior; no es contenido."],
  [/csrf\.token|system\.paths/, "Enlace malformado que generaba la plantilla anterior; nunca fue contenido."],
  [/^\/index\.php\/galeria-de-fotos(\/|\?|$)/, "Galería de fotos rota en el portal anterior (sus carpetas respondían «Error 404»); sin equivalente en A2 4.02 (novedad N-33)."],
  [/^\/index\.php\/(propiedades\/)?propiedades-disponibles-de-inversion(\/|\?|$)/, "Contenido conservado como borrador en el CMS hasta que se decida su ubicación (novedad N-33)."],
  [/^\/index\.php\/de-interes(\/|\?|$)/, "Sección «De interés» con un artículo de otra institución sin fecha; sin equivalente en A2 4.02 (informe de migración)."],
  [/^\/(transparencia\/)?index\.php\/(mapa-de-sitio|resultado-de-busqueda)(\/|\?|$)/, "Mapa del sitio y buscador: el portal nuevo los tiene desde S6; la redirección se agrega entonces."],
  [/^\/(\.well-known|wp-|xmlrpc|cgi-bin|phpmyadmin)/i, "Sondeo automático de robots; nunca fue contenido del portal."],
  [/^\/(robots\.txt|sitemap\.xml|favicon\.ico|humans\.txt|ads\.txt)$/, "Archivo técnico: el portal nuevo publica el suyo (S6)."],
  [/^\/-?\d+(\.\d+)?$/, "Dirección malformada registrada por el archivo web; nunca fue contenido."],
];

type Fuente = { url: string; host: string; origen: string };
const fuentes = new Map<string, Fuente>();

function agregar(urlCruda: string, origen: string) {
  let host = "corphotels.gob.do";
  try {
    host = new URL(urlCruda.replace(/^\/\//, "https://"), "https://corphotels.gob.do").hostname.replace(/:\d+$/, "");
  } catch {
    return;
  }
  const n = normalizarUrl(urlCruda);
  const clave = n ?? `${host}${urlCruda}`;
  if (!fuentes.has(clave)) fuentes.set(clave, { url: n ?? urlCruda, host: host.replace(/^www\./, ""), origen });
}

for (const linea of readFileSync(ARCHIVO_URLS_INDEXADAS, "utf8").split(/\r?\n/)) {
  const url = linea.split(" ")[0];
  if (url) agregar(url, "Internet Archive");
}
if (existsSync(ARCHIVO_INVENTARIO)) {
  const inv: Inventario = JSON.parse(readFileSync(ARCHIVO_INVENTARIO, "utf8"));
  for (const p of inv.paginas) agregar(p.url, "Recorrido del sitio");
  for (const a of inv.archivos) agregar(a.urlDescarga, "Recorrido del sitio");
}

type Fila = { url: string; origen: string; resultado: "301" | "existe" | "justificada" | "FALLA"; detalle: string };
const filas: Fila[] = [];
const destinos = new Map<string, number>();

async function estado(ruta: string): Promise<{ codigo: number; ubicacion: string | null }> {
  for (let intento = 1; ; intento++) {
    try {
      const r = await fetch(new URL(ruta, BASE), { redirect: "manual", signal: AbortSignal.timeout(60_000) });
      await r.body?.cancel();
      return { codigo: r.status, ubicacion: r.headers.get("location") };
    } catch (e) {
      if (intento >= 3) return { codigo: 0, ubicacion: (e as Error).message };
    }
  }
}

/** El destino debe responder 200, siguiendo como máximo 3 saltos. */
async function destinoValido(ruta: string): Promise<number> {
  if (destinos.has(ruta)) return destinos.get(ruta)!;
  let actual = ruta;
  let codigo = 0;
  for (let salto = 0; salto < 3; salto++) {
    const r = await estado(actual);
    codigo = r.codigo;
    if (codigo >= 300 && codigo < 400 && r.ubicacion) {
      actual = new URL(r.ubicacion, new URL(actual, BASE)).pathname + new URL(r.ubicacion, new URL(actual, BASE)).search;
      continue;
    }
    break;
  }
  destinos.set(ruta, codigo);
  return codigo;
}

async function verificar(f: Fuente) {
  if (f.host !== "corphotels.gob.do") {
    filas.push({ url: `${f.host}${f.url}`, origen: f.origen, resultado: "justificada", detalle: `Subdominio anterior (${f.host}): su redirección se configura en el DNS y Front Door en el corte (S9, novedad N-32).` });
    return;
  }
  const justificacion = JUSTIFICACIONES.find(([patron]) => patron.test(f.url));
  if (justificacion) {
    filas.push({ url: f.url, origen: f.origen, resultado: "justificada", detalle: justificacion[1] });
    return;
  }
  const r = await estado(f.url);
  if (r.codigo === 301 && r.ubicacion) {
    const destino = new URL(r.ubicacion, BASE);
    const ruta = destino.pathname + destino.search;
    const final = await destinoValido(ruta);
    filas.push(
      final === 200
        ? { url: f.url, origen: f.origen, resultado: "301", detalle: ruta }
        : { url: f.url, origen: f.origen, resultado: "FALLA", detalle: `301 a ${ruta}, que responde ${final}` },
    );
    return;
  }
  if (r.codigo === 200) {
    filas.push({ url: f.url, origen: f.origen, resultado: "existe", detalle: "La misma dirección existe en el portal nuevo" });
    return;
  }
  filas.push({ url: f.url, origen: f.origen, resultado: "FALLA", detalle: `Responde ${r.codigo || r.ubicacion}` });
}

const lista = [...fuentes.values()];
console.log(`Verificando ${lista.length} URL contra ${BASE}…`);
let i = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (i < lista.length) {
      const f = lista[i++];
      await verificar(f);
      if (filas.length % 500 === 0) console.log(`  ${filas.length} de ${lista.length}`);
    }
  }),
);

filas.sort((a, b) => a.resultado.localeCompare(b.resultado) || a.url.localeCompare(b.url));
const csv = (v: string) => `"${v.replace(/"/g, '""')}"`;
mkdirSync(path.dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, ["url_anterior,fuente,resultado,destino_o_justificacion", ...filas.map((f) => [f.url, f.origen, f.resultado, f.detalle].map(csv).join(","))].join("\n") + "\n");

const cuenta = (r: Fila["resultado"]) => filas.filter((f) => f.resultado === r).length;
const fallas = cuenta("FALLA");
console.log(
  `Total ${filas.length}: ${cuenta("301")} con 301, ${cuenta("existe")} existen igual, ${cuenta("justificada")} justificadas, ${fallas} sin resolver → ${SALIDA}`,
);
for (const f of filas.filter((f) => f.resultado === "FALLA").slice(0, 40)) console.log(`  FALLA ${f.url} — ${f.detalle}`);
process.exit(fallas === 0 ? 0 : 1);
