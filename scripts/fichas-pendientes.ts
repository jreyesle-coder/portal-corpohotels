/**
 * Preauditoría A2 4.02.b (S9): lista los servicios publicados sin la ficha A5 completa.
 * Uso: npm run fichas-pendientes
 */
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "servicios",
  where: { and: [{ _status: { equals: "published" } }, { fichaCompleta: { not_equals: true } }] },
  limit: 500,
  depth: 0,
  overrideAccess: true,
});
if (docs.length === 0) console.log("Todos los servicios publicados tienen la ficha A5 completa.");
for (const s of docs) console.log(`- ${s.nombre}: falta ${s.camposPendientes}`);
process.exit(docs.length === 0 ? 0 : 1);
