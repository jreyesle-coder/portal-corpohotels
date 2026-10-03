/**
 * Preauditoría A2 4.03 (S9): lista las secciones de transparencia sin contenido publicado.
 * Una sección cumple si tiene documentos o un texto de la OAI, si su contenido es un enlace
 * obligatorio (SAIP, 311, Concursa…) o si reutiliza contenido del portal (normas del Marco legal,
 * organigrama, catálogo de servicios). Termina con error si queda alguna: paso obligatorio del
 * despliegue a producción (docs/salida-a-produccion.md).
 * Uso: npm run transparencia-pendientes
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { DESTINOS } from "../src/contenido/transparencia";

const payload = await getPayload({ config });
const sistema = { overrideAccess: true, depth: 0, pagination: false } as const;

const conDocumentos = new Set(
  (await payload.find({ collection: "documentos", where: { area: { equals: "transparencia" } }, select: { seccionTransparencia: true }, ...sistema })).docs.map(
    (d) => d.seccionTransparencia,
  ),
);
const conTexto = new Set((await payload.find({ collection: "textos-transparencia", ...sistema })).docs.map((t) => t.seccion));
const normas = (await payload.find({ collection: "documentos", where: { seccion: { equals: "marco-legal" } }, ...sistema })).docs;
const NORMA: Record<string, string[]> = {
  "base-legal/constitucion": ["constitucion"],
  "base-legal/leyes": ["ley"],
  "base-legal/decretos": ["decreto"],
  "base-legal/resoluciones": ["resolucion"],
  "base-legal/otras-normativas": ["reglamento", "normativa", "otra"],
};
const organigrama = (await payload.find({ collection: "paginas", where: { slug: { equals: "organigrama" } }, ...sistema })).docs[0];
const servicios = await payload.count({ collection: "servicios", where: { _status: { equals: "published" } }, overrideAccess: true });

const reutiliza = (valor: string) =>
  (NORMA[valor] && normas.some((n) => NORMA[valor].includes(n.tipoNorma ?? ""))) ||
  (valor === "estructura-organica" && Boolean(organigrama?.imagen || organigrama?.documentos?.length)) ||
  (valor === "servicios" && servicios.totalDocs > 0);

const pendientes = DESTINOS.filter(
  (d) => !conDocumentos.has(d.valor as never) && !conTexto.has(d.valor as never) && !(d.subseccion?.enlace ?? d.seccion.enlace) && !reutiliza(d.valor),
);

if (pendientes.length === 0) console.log(`Las ${DESTINOS.length} secciones de transparencia tienen contenido publicado.`);
else console.log(`${pendientes.length} de ${DESTINOS.length} secciones de transparencia sin contenido:`);
for (const d of pendientes) console.log(`- ${d.subseccion ? `${d.seccion.titulo} › ` : ""}${d.titulo}`);
process.exit(pendientes.length === 0 ? 0 : 1);
