import type pg from "pg";
import { normalizarUrl } from "./normalizar";

/** Rutas del portal anterior (Joomla): todo lo que no existe en el portal nuevo. */
export const RUTAS_ANTERIORES = /^\/(index\.php|transparencia\/index\.php|transparencia\/images\/|images\/|media\/k2\/|component\/)/;

export const instalacion = (url: string): "portal" | "transparencia" => (url.startsWith("/transparencia/") ? "transparencia" : "portal");

/**
 * Candidatos por identificador anterior, que valen más que la URL: una misma descarga o categoría de
 * Phoca y una misma noticia de K2 se alcanzan desde varias rutas del menú anterior.
 */
export function identificadores(url: string): string[] {
  const ids: string[] = [];
  // Son dos instalaciones de Joomla: los números de Phoca se repiten entre el portal y transparencia.
  const sitio = instalacion(url);
  const descarga = /[?&]download=(\d+)/.exec(url);
  if (descarga) ids.push(`phoca:${sitio}:${descarga[1]}`);
  const categoria = /\/category\/(\d+)/.exec(url);
  if (categoria) ids.push(`phoca-cat:${sitio}:${categoria[1]}`);
  const item = /\/item\/(\d+)/.exec(url) ?? /[?&]id=(\d+)/.exec(url.includes("com_k2") ? url : "");
  if (item) ids.push(`k2:${item[1]}`);
  return ids;
}

const CONSULTA = `
  SELECT destino FROM redirecciones
  WHERE origen = ANY($2::text[])
     OR (tipo = 'prefijo' AND left($1, length(origen)) = origen
         AND (length($1) = length(origen) OR substr($1, length(origen) + 1, 1) IN ('/', '?')))
  ORDER BY CASE tipo WHEN 'identificador' THEN 0 WHEN 'exacta' THEN 1 ELSE 2 END, length(origen) DESC
  LIMIT 1`;

/** Destino de una URL del portal anterior, o null si no tiene equivalente. */
export async function buscarRedireccion(pool: pg.Pool, rutaConConsulta: string): Promise<string | null> {
  const url = normalizarUrl(rutaConConsulta);
  if (!url) return null;
  const r = await pool.query<{ destino: string }>(CONSULTA, [url, [url, ...identificadores(url)]]);
  return r.rows[0]?.destino ?? null;
}
