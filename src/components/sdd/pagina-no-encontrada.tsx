import Link from "next/link";
import { menuPrincipal, informate } from "@/contenido/sitio";
import { FormularioBusqueda } from "@/components/sdd/buscador";
import { RastroNavegacion } from "@/components/sdd/rastro-navegacion";

/**
 * Error 404 con la identidad gráfica del portal, su estructura y sugerencias (A2 2.01.b.xii)
 * y enlace al inicio (A2 6.01.i).
 */
export function PaginaNoEncontrada() {
  return (
    <>
      <RastroNavegacion migas={[{ etiqueta: "Página no encontrada" }]} />
      <div className="contenedor grid gap-10 py-10 esc:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-sm font-semibold text-primario">Error 404</p>
          <h1 className="mb-4 text-2xl font-bold text-titulo esc:text-3xl">Página no encontrada</h1>
          <p className="mb-6 max-w-2xl">
            La página que busca no existe o cambió de dirección. Puede que el enlace esté incompleto o que la página se
            haya movido al renovar el portal.
          </p>

          <h2 className="mb-2 text-lg font-semibold text-titulo">Le sugerimos</h2>
          <ul className="mb-8 list-disc space-y-1 pl-6">
            <li>Revisar que la dirección esté bien escrita.</li>
            <li>
              Volver a la{" "}
              <Link href="/" className="text-primario underline underline-offset-2">
                página de inicio
              </Link>
              .
            </li>
            <li>Buscar el contenido con el buscador del portal.</li>
            <li>
              Escribirnos desde{" "}
              <Link href="/contactos" className="text-primario underline underline-offset-2">
                Contactos
              </Link>{" "}
              si el problema continúa.
            </li>
          </ul>

          <h2 className="mb-2 text-lg font-semibold text-titulo">Buscar en el portal</h2>
          <FormularioBusqueda id="busqueda-404" />
        </div>

        <nav aria-label="Estructura del portal" className="rounded-lg border border-borde bg-superficie p-5">
          <h2 className="mb-3 text-lg font-semibold text-titulo">Estructura del portal</h2>
          <ul className="space-y-2">
            {[...menuPrincipal, ...informate].map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-primario underline underline-offset-2">
                  {s.etiqueta}
                </Link>
                {s.hijos && (
                  <ul className="mt-1 space-y-1 border-l border-borde pl-4 text-sm">
                    {s.hijos.map((h) => (
                      <li key={h.href}>
                        <Link href={h.href} className="text-primario underline underline-offset-2">
                          {h.etiqueta}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
