import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import pg from "pg";

/**
 * Refresca el índice del buscador (vista `busqueda_indice`) poco después de guardar o borrar
 * contenido. CONCURRENTLY deja seguir buscando mientras se refresca; varios cambios seguidos
 * (una carga masiva) se agrupan en un solo refresco.
 */
declare global {
  var poolIndice: pg.Pool | undefined;
}
const pool = () => (globalThis.poolIndice ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 }));

let pendiente: ReturnType<typeof setTimeout> | null = null;

export async function refrescarIndiceAhora() {
  await pool().query("REFRESH MATERIALIZED VIEW CONCURRENTLY busqueda_indice");
}

function programar() {
  if (pendiente) return;
  pendiente = setTimeout(() => {
    pendiente = null;
    refrescarIndiceAhora().catch((e) => console.error("No se pudo refrescar el índice de búsqueda:", (e as Error).message));
  }, 2000);
  pendiente.unref?.();
}

export const refrescarBusqueda: CollectionAfterChangeHook = ({ doc }) => {
  programar();
  return doc;
};

export const refrescarBusquedaAlBorrar: CollectionAfterDeleteHook = ({ doc }) => {
  programar();
  return doc;
};
