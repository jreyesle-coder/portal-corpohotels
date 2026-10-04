/**
 * Elimina el contenido creado por las pruebas automáticas (títulos y textos con marca de prueba).
 * Uso: npm run limpiar-pruebas
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { refrescarIndiceAhora } from "../src/busqueda/refrescar";

const payload = await getPayload({ config });
const sistema = { overrideAccess: true } as const;
const borrados: Record<string, number> = {};
const borrar = async (collection: "noticias" | "documentos" | "medios" | "categorias", where: object) => {
  const r = await payload.delete({ collection, where: where as never, ...sistema });
  borrados[collection] = r.docs.length;
};
await borrar("noticias", { titulo: { like: "Noticia de prueba" } });
await borrar("documentos", {
  or: [{ titulo: { like: "Memoria institucional " } }, { titulo: { like: "Prueba transparencia " } }, { titulo: { equals: "Otro" } }],
});
const redirecciones = await payload.delete({ collection: "redirecciones", where: { nota: { equals: "prueba automatizada" } }, ...sistema });
borrados.redirecciones = redirecciones.docs.length;
// Textos de transparencia de las pruebas (el contenido es JSON de Lexical: se revisa ya leído).
const textos = await payload.find({ collection: "textos-transparencia", pagination: false, depth: 0, ...sistema });
const deTextos = textos.docs.filter((t) => JSON.stringify(t.contenido).includes("prueba automatizada"));
for (const t of deTextos) await payload.delete({ collection: "textos-transparencia", id: t.id, ...sistema });
borrados["textos-transparencia"] = deTextos.length;
await borrar("medios", { alt: { equals: "Fachada de la sede de CORPHOTELS" } });
await borrar("categorias", { nombre: { like: "Categoría " } });
// Casos y encuestas de las pruebas: los datos están cifrados, así que se filtran ya descifrados.
const casos = await payload.find({ collection: "casos", limit: 1000, depth: 0, ...sistema });
const deCasos = casos.docs.filter((c) => typeof c.nombre === "string" && c.nombre.startsWith("Prueba automatizada"));
for (const c of deCasos) await payload.delete({ collection: "casos", id: c.id, ...sistema });
borrados.casos = deCasos.length;
const encuestas = await payload.delete({
  collection: "encuestas",
  where: { comentario: { like: "prueba automatizada" } },
  ...sistema,
});
borrados.encuestas = encuestas.docs.length;
console.log("Contenido de prueba eliminado:", borrados);
// El índice del buscador se refresca al terminar la carga (S6).
await refrescarIndiceAhora();
process.exit(0);
