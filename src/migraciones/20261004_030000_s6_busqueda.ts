import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Índice del buscador del portal (A2 2.01.i.ii, S6): búsqueda de texto completo de PostgreSQL en
 * español, sin distinguir tildes, sobre lo publicado de noticias, páginas, servicios, preguntas
 * frecuentes y documentos. Es una vista materializada que el CMS refresca al guardar contenido.
 *
 * Si una migración futura cambia el tipo de una columna que usa la vista, debe borrarla y crearla
 * de nuevo (PostgreSQL no permite alterar columnas de las que depende una vista).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE EXTENSION IF NOT EXISTS unaccent;

  -- unaccent() no es IMMUTABLE: esta envoltura permite usarlo en índices.
  CREATE OR REPLACE FUNCTION f_sin_tildes(texto text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, texto) $$;

  DROP TEXT SEARCH CONFIGURATION IF EXISTS es_portal;
  CREATE TEXT SEARCH CONFIGURATION es_portal (COPY = spanish);
  ALTER TEXT SEARCH CONFIGURATION es_portal
    ALTER MAPPING FOR hword, hword_part, word WITH unaccent, spanish_stem;

  -- Texto plano de un campo de texto enriquecido (Lexical): todos sus nodos "text".
  CREATE OR REPLACE FUNCTION f_texto_lexical(contenido jsonb) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$ SELECT coalesce(string_agg(t, ' '), '') FROM jsonb_path_query(contenido, 'strict $.**.text') AS x(v),
                LATERAL (SELECT v #>> '{}' AS t) y $$;

  CREATE MATERIALIZED VIEW busqueda_indice AS
  WITH filas AS (
    SELECT 'noticia'::text AS tipo, n.id, n.titulo, n.resumen, n.slug AS clave, NULL::text AS padre,
           n.fecha AS fecha, true AS visible, coalesce(n.seo_no_indexar, false) AS no_indexar,
           f_texto_lexical(n.contenido) AS cuerpo
      FROM noticias n WHERE n._status = 'published'
    UNION ALL
    SELECT 'pagina', p.id, p.titulo, p.seo_descripcion, p.slug, s.slug,
           p.updated_at, true, coalesce(p.seo_no_indexar, false), f_texto_lexical(p.contenido)
      FROM paginas p LEFT JOIN paginas s ON s.id = p.padre_id WHERE p._status = 'published'
    UNION ALL
    SELECT 'servicio', v.id, v.nombre, v.resumen, v.slug, NULL,
           v.updated_at, coalesce(v.ficha_completa, false), coalesce(v.seo_no_indexar, false),
           concat_ws(' ', v.nombre_coloquial, v.dirigido_a, f_texto_lexical(v.contenido))
      FROM servicios v WHERE v._status = 'published'
    UNION ALL
    SELECT 'pregunta', q.id, q.pregunta, NULL, NULL, NULL, q.updated_at, true, false, f_texto_lexical(q.respuesta)
      FROM preguntas_frecuentes q WHERE q._status = 'published'
    UNION ALL
    SELECT 'documento', d.id, d.titulo, d.descripcion, d.filename,
           coalesce(d.seccion_transparencia::text, d.seccion::text), d.fecha_creacion, true, false, NULL
      FROM documentos d
  )
  SELECT tipo, id, titulo, resumen, clave, padre, fecha, visible, no_indexar,
         setweight(to_tsvector('es_portal', coalesce(titulo, '')), 'A')
           || setweight(to_tsvector('es_portal', coalesce(resumen, '')), 'B')
           || setweight(to_tsvector('es_portal', coalesce(cuerpo, '')), 'C') AS documento,
         f_sin_tildes(lower(coalesce(titulo, ''))) AS titulo_plano
    FROM filas;

  CREATE UNIQUE INDEX busqueda_indice_clave ON busqueda_indice (tipo, id);
  CREATE INDEX busqueda_indice_documento ON busqueda_indice USING gin (documento);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP MATERIALIZED VIEW IF EXISTS busqueda_indice;
  DROP FUNCTION IF EXISTS f_texto_lexical(jsonb);
  DROP TEXT SEARCH CONFIGURATION IF EXISTS es_portal;
  DROP FUNCTION IF EXISTS f_sin_tildes(text);`)
}
