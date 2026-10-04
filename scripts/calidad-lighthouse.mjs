/**
 * Lighthouse (S7, A2 5.04.2): rendimiento, accesibilidad, buenas prácticas y SEO de las plantillas
 * principales, en móvil y escritorio. Meta: 90 o más en cada categoría. Cada página se mide 3 veces
 * y se informa la mediana, como recomienda Lighthouse por la variación natural de la simulación.
 * Uso: BASE=http://localhost:3100 node scripts/calidad-lighthouse.mjs  (usa el Chromium de Playwright)
 * Escribe docs/calidad/lighthouse/resumen.md y un informe HTML por página.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import desktop from "lighthouse/core/config/desktop-config.js";

const BASE = process.env.BASE ?? "http://localhost:3100";
const RUTAS = ["/", "/noticias", "/servicios/solicitud-de-no-objecion-para-obras", "/transparencia/presupuesto/ejecucion", "/contactos", "/buscar?q=presupuesto"];
const CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"];
const NOMBRES = { performance: "Rendimiento", accessibility: "Accesibilidad", "best-practices": "Buenas prácticas", seo: "SEO" };
/** Excepciones justificadas: los resultados de búsqueda llevan NoIndex a propósito (A2 6.01.j). */
const EXCEPCIONES = { "/buscar?q=presupuesto": { seo: "NoIndex intencional en resultados de búsqueda (A2 6.01.j)" } };
const SALIDA = path.resolve(import.meta.dirname, "../docs/calidad/lighthouse");
mkdirSync(SALIDA, { recursive: true });

const PUERTO = 9223;
const navegador = await chromium.launch({ args: [`--remote-debugging-port=${PUERTO}`] });
const filas = [];
let bajo = 0;
for (const modo of ["movil", "escritorio"]) {
  for (const ruta of RUTAS) {
    const opciones = { port: PUERTO, output: "html", onlyCategories: CATEGORIAS, logLevel: "error" };
    const corridas = [];
    for (let i = 0; i < 3; i++) corridas.push(await lighthouse(BASE + ruta, opciones, modo === "escritorio" ? desktop : undefined));
    const mediana = (v) => [...v].sort((a, b) => a - b)[1];
    const puntajes = CATEGORIAS.map((c) => mediana(corridas.map((x) => Math.round((x.lhr.categories[c].score ?? 0) * 100))));
    const r = corridas.find((x) => Math.round((x.lhr.categories.performance.score ?? 0) * 100) === puntajes[0]) ?? corridas[0];
    bajo += puntajes.filter((p, i) => p < 90 && !EXCEPCIONES[ruta]?.[CATEGORIAS[i]]).length;
    const nombre = `${modo}-${ruta.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "portada"}.html`;
    writeFileSync(path.join(SALIDA, nombre), r.report);
    const celdas = puntajes.map((p, i) => (p >= 90 ? p : EXCEPCIONES[ruta]?.[CATEGORIAS[i]] ? `${p}*` : `**${p}**`));
    filas.push(`| ${modo === "movil" ? "Móvil" : "Escritorio"} | \`${ruta}\` | ${celdas.join(" | ")} | [informe](${nombre}) |`);
    console.log(modo, ruta, puntajes.join(" "));
  }
}
await navegador.close();
writeFileSync(
  path.join(SALIDA, "resumen.md"),
  `# Lighthouse — ${new Date().toISOString().slice(0, 10)}\n\nMeta: 90 o más en cada categoría (S7). Mediana de 3 corridas por página. Servidor: compilación de producción local.\n\n| Dispositivo | Página | ${CATEGORIAS.map((c) => NOMBRES[c]).join(" | ")} | Detalle |\n| --- | --- | ${CATEGORIAS.map(() => "---").join(" | ")} | --- |\n${filas.join("\n")}\n\n\\* ${Object.values(EXCEPCIONES).flatMap((e) => Object.values(e)).join("; ")}.\n`,
);
console.log(bajo ? `${bajo} puntaje(s) por debajo de 90.` : "Todas las categorías en 90 o más.");
process.exit(bajo ? 1 : 0);
