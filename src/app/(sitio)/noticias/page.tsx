import type { Metadata } from "next";
import Link from "next/link";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { TarjetaNoticia } from "@/components/sdd/tarjeta-noticia";
import { listarNoticias } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Noticias y actividades de la Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo.",
};

type Props = { searchParams: Promise<{ pagina?: string }> };

/** Noticias (A2 4.02): listado paginado, de la más reciente a la más antigua. */
export default async function Noticias({ searchParams }: Props) {
  const solicitada = Number.parseInt((await searchParams).pagina ?? "1", 10);
  // Acotada: un número fuera de rango no debe llegar a la base de datos (hallazgo de ZAP, S7).
  const pagina = Number.isFinite(solicitada) && solicitada > 0 ? Math.min(solicitada, 1000) : 1;
  const resultado = await listarNoticias(pagina);
  const enlace = (n: number) => (n === 1 ? "/noticias" : `/noticias?pagina=${n}`);

  return (
    <PlantillaPagina titulo="Noticias" migas={[{ etiqueta: "Noticias" }]}>
      {resultado.docs.length === 0 ? (
        <p>No hay noticias en esta página.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.docs.map((n, i) => (
            <li key={n.id}>
              <TarjetaNoticia noticia={n} nivel={2} destacada={i === 0} />
            </li>
          ))}
        </ul>
      )}
      {resultado.totalPages > 1 && (
        <nav aria-label="Páginas de noticias" className="mt-8 print:hidden">
          <p className="mb-2 text-sm text-texto-suave">
            Página {resultado.page} de {resultado.totalPages}
          </p>
          <ul className="flex flex-wrap gap-2">
            {Array.from({ length: resultado.totalPages }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <Link
                  href={enlace(n)}
                  aria-current={n === resultado.page ? "page" : undefined}
                  aria-label={`Página ${n}`}
                  className={`flex size-11 items-center justify-center rounded-md border font-semibold ${
                    n === resultado.page
                      ? "border-primario bg-primario text-sobre-primario"
                      : "border-borde text-primario hover:border-primario"
                  }`}
                >
                  {n}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </PlantillaPagina>
  );
}
