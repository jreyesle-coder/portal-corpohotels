import "server-only";
import pg from "pg";
import { tipoLegible } from "@/cms/archivos";
import { obtenerConfig } from "@/config";
import { buscarDestino } from "@/contenido/transparencia";

/**
 * Buscador del portal (A2 2.01.i.ii) sobre la vista `busqueda_indice` (migración s6_busqueda):
 * a) la consulta vacía no busca e indica qué escribir; b) los resultados se ordenan por relevancia
 * (y, a igual relevancia, lo más reciente primero); c) sin duplicados: el PDF y el Excel de un
 * mismo informe son un solo resultado con sus formatos; d) se informa el total de resultados.
 */
export const TIPOS_BUSQUEDA = {
  noticia: "Noticias",
  pagina: "Páginas",
  servicio: "Servicios",
  pregunta: "Preguntas frecuentes",
  documento: "Documentos",
} as const;
export type TipoBusqueda = keyof typeof TIPOS_BUSQUEDA;

export const POR_PAGINA_BUSQUEDA = 10;

declare global {
  var poolBusqueda: pg.Pool | undefined;
}
const pool = () => (globalThis.poolBusqueda ??= new pg.Pool({ connectionString: obtenerConfig().DATABASE_URL, max: 4 }));

export type Resultado = {
  tipo: TipoBusqueda;
  titulo: string;
  resumen: string | null;
  url: string;
  fecha: string | null;
  /** Documentos: un enlace por formato y la sección donde se publica. */
  archivos?: { url: string; formato: string }[];
  seccion?: { titulo: string; url: string };
};

/** Términos con prefijo («presupues» encuentra «presupuesto»), solo letras y números. */
function consultaPrefijos(q: string): string {
  return (q.normalize("NFC").match(/[\p{L}\p{N}]+/gu) ?? [])
    .slice(0, 12)
    .map((t) => `${t}:*`)
    .join(" & ");
}

const CONSULTA = `
  WITH q AS (
    SELECT websearch_to_tsquery('es_portal', $1) || CASE WHEN $2 = '' THEN ''::tsquery ELSE to_tsquery('es_portal', $2) END AS q
  ),
  coincidencias AS (
    SELECT b.*, ts_rank_cd(b.documento, q.q, 32) AS rango
      FROM busqueda_indice b, q
     WHERE (b.documento @@ q.q OR b.titulo_plano LIKE '%' || f_sin_tildes(lower($1)) || '%')
       AND (b.visible OR $3 = '0')
  ),
  grupos AS (
    SELECT tipo,
           CASE WHEN tipo = 'documento' THEN lower(titulo) || '|' || coalesce(padre, '') ELSE id::text END AS grupo,
           max(titulo) AS titulo, max(resumen) AS resumen, max(clave) FILTER (WHERE tipo <> 'documento') AS clave,
           max(padre) AS padre, max(fecha) AS fecha, max(rango) AS rango,
           array_agg(id ORDER BY id) AS ids
      FROM coincidencias GROUP BY 1, 2
  )
  SELECT g.*, count(*) OVER () AS total,
         (SELECT json_object_agg(tipo, n) FROM (SELECT tipo, count(*) AS n FROM grupos GROUP BY tipo) c) AS por_tipo
    FROM grupos g
   WHERE $4 = '' OR g.tipo = $4
   ORDER BY g.rango DESC, g.fecha DESC NULLS LAST, g.titulo
   LIMIT $5 OFFSET $6`;

export async function buscar(texto: string, tipo: TipoBusqueda | "", pagina: number) {
  const q = texto.trim().slice(0, 100);
  const exigirFicha = obtenerConfig().EXIGIR_FICHA_A5_COMPLETA === "1" ? "1" : "0";
  const { rows } = await pool().query(CONSULTA, [
    q,
    consultaPrefijos(q),
    exigirFicha === "1" ? "1" : "0",
    tipo,
    POR_PAGINA_BUSQUEDA,
    (pagina - 1) * POR_PAGINA_BUSQUEDA,
  ]);
  const porTipo: Partial<Record<TipoBusqueda, number>> = rows[0]?.por_tipo ?? {};
  const totalTodos = Object.values(porTipo).reduce((a, b) => a + Number(b), 0);
  const total = rows.length ? Number(rows[0].total) : tipo ? 0 : totalTodos;
  // Los documentos agrupados necesitan sus archivos (nombre y tipo) para los enlaces por formato.
  const idsDocumentos = rows.filter((r) => r.tipo === "documento").flatMap((r) => r.ids as number[]);
  const archivos = new Map<number, { filename: string; mime: string | null }>();
  if (idsDocumentos.length) {
    const r = await pool().query("SELECT id, filename, mime_type FROM documentos WHERE id = ANY($1)", [idsDocumentos]);
    for (const a of r.rows) archivos.set(a.id, { filename: a.filename, mime: a.mime_type });
  }
  const resultados: Resultado[] = rows.map((r) => {
    const base = { tipo: r.tipo as TipoBusqueda, titulo: r.titulo, resumen: r.resumen, fecha: r.fecha ? new Date(r.fecha).toISOString() : null };
    switch (r.tipo as TipoBusqueda) {
      case "noticia":
        return { ...base, url: `/noticias/${r.clave}` };
      case "servicio":
        return { ...base, url: `/servicios/${r.clave}` };
      case "pregunta":
        return { ...base, url: "/preguntas-frecuentes" };
      case "pagina":
        return { ...base, url: r.padre ? `/${r.padre}/${r.clave}` : `/${r.clave}` };
      case "documento": {
        const enlaces = (r.ids as number[]).flatMap((id) => {
          const a = archivos.get(id);
          return a?.filename ? [{ url: `/api/documentos/file/${encodeURIComponent(a.filename)}`, formato: tipoLegible(a.mime, a.filename) }] : [];
        });
        return { ...base, url: enlaces[0]?.url ?? "/transparencia", archivos: enlaces, seccion: seccionDocumento(r.padre) };
      }
    }
  });
  return { total, porTipo: { ...porTipo, todos: totalTodos }, resultados };
}

function seccionDocumento(padre: string | null): Resultado["seccion"] {
  if (!padre) return undefined;
  const destino = buscarDestino(padre);
  if (destino) return { titulo: destino.titulo, url: destino.ruta };
  if (padre === "marco-legal") return { titulo: "Marco legal", url: "/sobre-nosotros/marco-legal" };
  if (padre === "organigrama") return { titulo: "Organigrama", url: "/sobre-nosotros/organigrama" };
  return undefined;
}
