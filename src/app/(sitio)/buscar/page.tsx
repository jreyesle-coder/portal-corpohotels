import type { Metadata } from "next";
import Link from "next/link";
import { buscar, POR_PAGINA_BUSQUEDA, TIPOS_BUSQUEDA, type TipoBusqueda } from "@/busqueda/buscar";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";

type Props = { searchParams: Promise<{ q?: string; tipo?: string; pagina?: string }> };

// Los resultados de búsqueda no se indexan en los buscadores externos (A2 6.01.j: NoIndex, Follow).
export const metadata: Metadata = {
  title: "Resultados de búsqueda",
  description: "Buscador de noticias, servicios, páginas, preguntas frecuentes y documentos del portal de CORPHOTELS.",
  robots: { index: false, follow: true },
};

const SINGULAR: Record<TipoBusqueda, string> = {
  noticia: "Noticia",
  pagina: "Página",
  servicio: "Servicio",
  pregunta: "Pregunta frecuente",
  documento: "Documento",
};

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : null;

function enlace(q: string, tipo: string, pagina = 1) {
  const p = new URLSearchParams({ q });
  if (tipo) p.set("tipo", tipo);
  if (pagina > 1) p.set("pagina", String(pagina));
  return `/buscar?${p}`;
}

/** Página de resultados del buscador (A2 2.01.i.ii). */
export default async function Buscar({ searchParams }: Props) {
  const parametros = await searchParams;
  const q = (parametros.q ?? "").trim().slice(0, 100);
  const tipo = (Object.hasOwn(TIPOS_BUSQUEDA, parametros.tipo ?? "") ? parametros.tipo : "") as TipoBusqueda | "";
  const pagina = Math.max(1, Math.min(500, Number(parametros.pagina) || 1));
  const datos = q ? await buscar(q, tipo, pagina) : null;
  const paginas = datos ? Math.ceil(datos.total / POR_PAGINA_BUSQUEDA) : 0;

  return (
    <PlantillaPagina titulo="Resultados de búsqueda" migas={[{ etiqueta: "Resultados de búsqueda" }]}>
      <form role="search" action="/buscar" method="get" className="mb-6 flex max-w-2xl flex-wrap gap-2">
        <label htmlFor="consulta" className="w-full font-semibold">
          ¿Qué quieres buscar?
        </label>
        <input
          id="consulta"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-borde bg-fondo px-3"
        />
        <button type="submit" className="min-h-11 cursor-pointer rounded-md bg-primario px-5 font-semibold text-sobre-primario">
          Buscar
        </button>
      </form>

      {!q && (
        // a) Consulta vacía: se indica qué hacer, sin mostrar resultados.
        <p role="status" className="max-w-2xl rounded-lg border border-borde bg-superficie p-4" data-busqueda-vacia>
          Escriba en el campo de búsqueda la palabra o frase que desea consultar, por ejemplo «nómina», «presupuesto» o el
          nombre de un servicio.
        </p>
      )}

      {datos && (
        <>
          {/* d) Cantidad de resultados. */}
          <p role="status" className="mb-4 text-lg" data-total-resultados={datos.total}>
            {datos.total === 0 ? (
              <>
                No se encontraron resultados para <strong>«{q}»</strong>. Revise la ortografía o use otras palabras.
              </>
            ) : (
              <>
                <strong>{datos.total.toLocaleString("es-DO")}</strong> {datos.total === 1 ? "resultado" : "resultados"} para{" "}
                <strong>«{q}»</strong>
                {tipo && <> en {TIPOS_BUSQUEDA[tipo].toLowerCase()}</>}
              </>
            )}
          </p>

          {datos.porTipo.todos > 0 && (
            <nav aria-label="Filtrar resultados" className="mb-6">
              <ul className="flex flex-wrap gap-2">
                {[["", "Todo", datos.porTipo.todos] as const, ...Object.entries(TIPOS_BUSQUEDA).map(([t, n]) => [t, n, datos.porTipo[t as TipoBusqueda] ?? 0] as const)]
                  .filter(([, , n]) => Number(n) > 0)
                  .map(([t, nombre, n]) => (
                    <li key={t}>
                      <Link
                        href={enlace(q, t)}
                        aria-current={t === tipo ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                          t === tipo ? "border-primario bg-primario text-sobre-primario" : "border-borde text-primario hover:border-primario"
                        }`}
                      >
                        {nombre} ({Number(n).toLocaleString("es-DO")})
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          )}

          {/* b) Ordenados por relevancia; c) sin duplicados. */}
          <ol className="max-w-3xl space-y-5" start={(pagina - 1) * POR_PAGINA_BUSQUEDA + 1} data-resultados>
            {datos.resultados.map((r) => (
              <li key={`${r.tipo}-${r.url}-${r.titulo}`} className="border-b border-borde pb-4" data-resultado={r.tipo}>
                <p className="text-sm font-semibold text-texto-suave">
                  {SINGULAR[r.tipo]}
                  {r.fecha && r.tipo !== "pagina" && <> · {fecha(r.fecha)}</>}
                </p>
                <h2 className="text-lg font-semibold">
                  {r.tipo === "documento" ? (
                    <EnlaceExterno href={r.url} className="text-primario underline-offset-2 hover:underline">
                      {r.titulo}
                    </EnlaceExterno>
                  ) : (
                    <Link href={r.url} className="text-primario underline-offset-2 hover:underline">
                      {r.titulo}
                    </Link>
                  )}
                </h2>
                {r.resumen && <p className="mt-1 line-clamp-3">{r.resumen}</p>}
                {r.archivos && r.archivos.length > 0 && (
                  <p className="mt-1 text-sm">
                    Descargar:{" "}
                    {r.archivos.map((a, i) => (
                      <span key={a.url}>
                        {i > 0 && " · "}
                        <EnlaceExterno href={a.url} className="font-semibold text-primario underline">
                          {a.formato}
                          <span className="sr-only"> de {r.titulo}</span>
                        </EnlaceExterno>
                      </span>
                    ))}
                    {r.seccion && (
                      <>
                        {" "}
                        · Sección:{" "}
                        <Link href={r.seccion.url} className="text-primario underline">
                          {r.seccion.titulo}
                        </Link>
                      </>
                    )}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {paginas > 1 && (
            <nav aria-label="Páginas de resultados" className="mt-8">
              <ul className="flex flex-wrap items-center gap-2">
                {pagina > 1 && (
                  <li>
                    <Link href={enlace(q, tipo, pagina - 1)} className="inline-flex min-h-11 items-center rounded-md border border-borde px-4 text-primario">
                      Anterior
                    </Link>
                  </li>
                )}
                <li className="px-2">
                  Página {pagina} de {paginas}
                </li>
                {pagina < paginas && (
                  <li>
                    <Link href={enlace(q, tipo, pagina + 1)} className="inline-flex min-h-11 items-center rounded-md border border-borde px-4 text-primario">
                      Siguiente
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </>
      )}
    </PlantillaPagina>
  );
}
