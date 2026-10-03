/**
 * Elimina el contenido creado por las pruebas automáticas (títulos y textos con marca de prueba).
 * Uso: npm run limpiar-pruebas
 */
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });
const sistema = { overrideAccess: true } as const;
const borrados: Record<string, number> = {};
const borrar = async (collection: "noticias" | "documentos" | "medios" | "categorias", where: object) => {
  const r = await payload.delete({ collection, where: where as never, ...sistema });
  borrados[collection] = r.docs.length;
};
await borrar("noticias", { titulo: { like: "Noticia de prueba" } });
await borrar("documentos", { or: [{ titulo: { like: "Memoria institucional " } }, { titulo: { equals: "Otro" } }] });
await borrar("medios", { alt: { equals: "Fachada de la sede de CORPHOTELS" } });
await borrar("categorias", { nombre: { like: "Categoría " } });
console.log("Contenido de prueba eliminado:", borrados);
process.exit(0);
