import type { Metadata } from "next";
import Link from "next/link";
import { metadatosPagina, PaginaCms, seccionSobreNosotros } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("sobre-nosotros");

/** «Sobre nosotros» con sus subsecciones obligatorias en el orden de A2 4.02.a. */
export default async function SobreNosotros() {
  const seccion = await seccionSobreNosotros("/sobre-nosotros");
  return (
    <PaginaCms
      slug="sobre-nosotros"
      migas={[]}
      seccion={seccion}
      despues={
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {seccion.enlaces.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="block h-full rounded-lg border border-borde bg-superficie p-5 text-lg font-semibold text-primario hover:border-primario hover:underline"
              >
                {e.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      }
    />
  );
}
