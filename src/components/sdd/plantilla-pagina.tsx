import Link from "next/link";
import { HerramientasPagina } from "./herramientas-pagina";
import { type Miga, RastroNavegacion } from "./rastro-navegacion";

export type EnlaceSeccion = { etiqueta: string; href: string; activo?: boolean };

/**
 * Plantilla de las páginas internas, sobre la división de contenido en paneles (A2 3.02.e):
 * superior = rastro de navegación; izquierdo = navegación de la sección; central = contenido.
 * El título visible (h1) es igual al texto del enlace del menú (A2 2.01.b.iv).
 */
export function PlantillaPagina({
  titulo,
  migas,
  seccion,
  lateral,
  urlPdf,
  antesDelTitulo,
  children,
}: {
  titulo: string;
  migas: Miga[];
  seccion?: { titulo: string; enlaces: EnlaceSeccion[] };
  /** Panel izquierdo propio, en lugar de la lista de `seccion` (menú vertical de transparencia). */
  lateral?: React.ReactNode;
  urlPdf?: string;
  antesDelTitulo?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <RastroNavegacion migas={migas} />
      <div className={`contenedor grid gap-8 py-8 ${
          lateral ? "esc:grid-cols-[18rem_1fr] esc:gap-10" : seccion ? "esc:grid-cols-[15rem_1fr] esc:gap-10" : ""
        }`}>
        {lateral}
        {seccion && (
          <nav aria-label={`Secciones de ${seccion.titulo}`} className="order-2 esc:order-none print:hidden">
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-texto-suave uppercase">{seccion.titulo}</h2>
            <ul className="border-l-2 border-borde">
              {seccion.enlaces.map((e) => (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={e.activo ? "page" : undefined}
                    className={`-ml-0.5 block border-l-[3px] py-2 pl-4 hover:text-primario ${
                      e.activo ? "border-primario font-semibold text-primario" : "border-transparent text-texto"
                    }`}
                  >
                    {e.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <article className="min-w-0">
          {antesDelTitulo}
          <h1 className="mb-4 text-2xl font-bold text-titulo esc:text-3xl">{titulo}</h1>
          <div className="mb-6">
            <HerramientasPagina titulo={titulo} urlPdf={urlPdf} />
          </div>
          {children}
        </article>
      </div>
    </>
  );
}
