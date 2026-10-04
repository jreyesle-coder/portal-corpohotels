/**
 * S5 — Informe de migración para la revisión de cada dueño de sección: qué se migró, qué se
 * descartó y por qué, equivalencias a validar y errores heredados del portal anterior. Escribe
 * docs/migracion/informe.md y docs/migracion/equivalencias.csv (ID anterior → URL nueva).
 * Uso: npm run migracion:informe   (después de importar y verificar)
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ARCHIVO_INVENTARIO, DIR_MIGRACION, type Inventario } from "./comun";

const docs = path.resolve(DIR_MIGRACION, "../docs/migracion");
const inv: Inventario = JSON.parse(readFileSync(ARCHIVO_INVENTARIO, "utf8"));
const r = JSON.parse(readFileSync(path.join(DIR_MIGRACION, "datos", "resultado.json"), "utf8"));
const archivoVerificacion = path.join(docs, "verificacion-urls.csv");

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
writeFileSync(
  path.join(docs, "equivalencias.csv"),
  ["tipo,id_anterior,url_anterior,url_nueva", ...r.equivalencias.map((e: Record<string, string>) => [e.tipo, e.id, e.anterior, e.nueva].map(csv).join(","))].join("\n") + "\n",
);

// Resumen de la verificación de URL.
const verificacion = existsSync(archivoVerificacion)
  ? readFileSync(archivoVerificacion, "utf8")
      .split("\n")
      .slice(1)
      .filter(Boolean)
      .map((l) => (l.match(/"((?:[^"]|"")*)"/g) ?? []).map((c) => c.slice(1, -1).replace(/""/g, '"')))
  : [];
const porResultado = (res: string) => verificacion.filter((f) => f[2] === res);
const justificaciones = new Map<string, number>();
for (const f of porResultado("justificada")) justificaciones.set(f[3], (justificaciones.get(f[3]) ?? 0) + 1);

const tabla = (cabecera: string[], filas: (string | number)[][]) =>
  filas.length
    ? [`| ${cabecera.join(" | ")} |`, `| ${cabecera.map(() => "---").join(" | ")} |`, ...filas.map((f) => `| ${f.map((c) => String(c).replace(/\|/g, "\\|")).join(" | ")} |`)].join("\n")
    : "_Ninguno._";

const paginasPor = (tipo: string) => inv.paginas.filter((p) => p.tipo === tipo && p.estado === 200).length;
const md = `# Informe de migración del portal anterior (S5)

Generado el ${r.generado.slice(0, 10)} con \`npm run migracion:informe\`. Contenido extraído del sitio público ${inv.fuente} el ${inv.generado.slice(0, 10)}. Cada dueño de sección revisa su parte y la firma antes de producción (requisito 6 de [salida-a-produccion.md](../salida-a-produccion.md)).

## Resumen

| Concepto | Cantidad |
| --- | --- |
| Páginas recorridas (portal y transparencia) | ${inv.paginas.length} |
| Carpetas de documentos de transparencia (Phoca) | ${inv.categorias.filter((c) => c.sitio === "transparencia").length} |
| Páginas de carpetas de transparencia | ${paginasPor("phoca")} |
| Noticias de K2 | ${paginasPor("k2-item")} |
| Documentos encontrados | ${inv.archivos.length} |
| Documentos migrados en esta corrida | ${r.documentos.nuevos} |
| Documentos migrados en corridas anteriores | ${r.documentos.existentes} |
| Documentos no migrados | ${r.documentos.omitidos.length} |
| Textos de transparencia cargados | ${r.textos.nuevos} (ya existían ${r.textos.existentes}) |
| Noticias migradas | ${r.noticias.nuevas} (ya existían ${r.noticias.existentes}) |
| URL verificadas | ${verificacion.length}: ${porResultado("301").length} con 301, ${porResultado("existe").length} existen igual, ${porResultado("justificada").length} justificadas, ${porResultado("FALLA").length} sin resolver |

La tabla completa de equivalencias (ID anterior → URL nueva) está en [equivalencias.csv](equivalencias.csv) y la verificación URL por URL en [verificacion-urls.csv](verificacion-urls.csv).

## Para la OAI: equivalencias a validar

Secciones del portal de transparencia anterior que no tienen una subsección idéntica en la NORTIC A2 4.03. Se ubicaron en la más cercana; la OAI confirma o indica otra.

${tabla(
  ["Sección anterior", "Ubicación nueva", "Documentos", "Motivo"],
  r.equivalenciasARevisar.map((e: Record<string, string | number>) => [e.anterior, e.destino, e.documentos, e.motivo]),
)}

## Contenido no migrado

### Documentos

${tabla(
  ["Identificador", "Título", "Motivo"],
  r.documentos.omitidos.map((o: Record<string, string>) => [o.id, o.titulo, o.motivo]),
)}

### Páginas sin equivalente

Páginas del portal anterior que no corresponden a ninguna sección del portal nuevo. Sus URL redirigen a la sección más cercana o quedan justificadas en la verificación.

${tabla(
  ["URL anterior", "Título", "Tipo"],
  r.sinEquivalente.slice(0, 200).map((p: Record<string, string>) => [p.url, p.titulo || "—", p.tipo]),
)}
${r.sinEquivalente.length > 200 ? `\n_Y ${r.sinEquivalente.length - 200} más (ver resultado.json)._\n` : ""}
### URL que no se redirigen (justificadas)

${tabla(
  ["Justificación", "URL"],
  [...justificaciones].sort((a, b) => b[1] - a[1]).map(([j, n]) => [j, n]),
)}

## Errores heredados para revisión

No se corrigieron en la migración: se migró el contenido tal como estaba publicado. Cada dueño decide.

| Hallazgo | Cantidad | Dueño |
| --- | --- | --- |
| Documentos sin descripción (se generó una a partir de su carpeta; A2 2.01.b.xiii pide una descripción propia) | ${r.hallazgos.sinDescripcion} | OAI |
| Títulos de documentos escritos todo en mayúsculas y sin tildes | ${r.hallazgos.titulosEnMayusculas} | OAI |
| Títulos repetidos dentro de una misma sección (posibles duplicados, o PDF y Excel del mismo informe) | ${r.hallazgos.titulosRepetidos.length} | OAI |
| Noticias con restos de herramientas de redacción en el texto (por ejemplo «Reporte-Saneamiento-San Gil-14-…») | ${r.hallazgos.textoConMarcasDeHerramientas.length} | Comunicaciones |
| Noticias sin lugar en la entrada (se puso «República Dominicana») | ${r.noticias.sinLugar.length} | Comunicaciones |
| Imágenes dentro del texto de las noticias (no se migran: el texto conserva la noticia; las fotos principales sí) | ${r.noticias.imagenesEnTexto} | Comunicaciones |
| Páginas del portal anterior que ya respondían con error | ${r.hallazgos.enlacesRotos.length} | TIC |

### Noticias con restos de herramientas de redacción

${r.hallazgos.textoConMarcasDeHerramientas.map((u: string) => `- ${u}`).join("\n") || "_Ninguna._"}

### Noticias sin lugar

${r.noticias.sinLugar.map((u: string) => `- ${u}`).join("\n") || "_Ninguna._"}

### Títulos repetidos (primeros 100)

${tabla(
  ["Sección", "Título", "Veces"],
  r.hallazgos.titulosRepetidos.slice(0, 100).map((t: Record<string, string | number>) => [t.destino, t.titulo, t.veces]),
)}

### Páginas del portal anterior con error

${tabla(
  ["URL", "Estado"],
  r.hallazgos.enlacesRotos.slice(0, 200).map((e: Record<string, string | number>) => [e.pagina, e.estado]),
)}
`;
writeFileSync(path.join(docs, "informe.md"), md);
console.log(`Informe: ${path.join(docs, "informe.md")}`);
process.exit(0);
