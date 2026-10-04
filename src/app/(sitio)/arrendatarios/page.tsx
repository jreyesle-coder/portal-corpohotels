import type { Metadata } from "next";
import Link from "next/link";
import { listarServicios } from "@/sitio/datos";
import { metadatosPagina, PaginaCms } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("arrendatarios");

/** Servicios que usan los arrendatarios de los complejos (contenido inicial, novedad N-35). */
const SERVICIOS_ARRENDATARIOS = ["solicitud-de-no-objecion-para-obras", "actualizacion-de-datos", "consulta-de-balance"];

/** Arrendatarios: sección propia de CORPHOTELS, al final del menú principal (A2 4.01.a). */
export default async function Arrendatarios() {
  const servicios = (await listarServicios()).filter((s) => SERVICIOS_ARRENDATARIOS.includes(s.slug));
  return (
    <PaginaCms
      slug="arrendatarios"
      migas={[]}
      despues={
        servicios.length > 0 && (
          <section aria-labelledby="servicios-arrendatarios" className="mt-8 max-w-3xl">
            <h2 id="servicios-arrendatarios" className="mb-4 text-xl font-semibold text-titulo">
              Servicios para arrendatarios
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {servicios.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/servicios/${s.slug}`}
                    className="flex h-full flex-col gap-1 rounded-md border-l-4 border-primario bg-superficie p-4 hover:text-primario"
                  >
                    <span className="font-semibold text-titulo">{s.nombre}</span>
                    <span className="text-sm">{s.resumen}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              ¿Necesita ayuda?{" "}
              <Link href="/contactos" className="font-semibold text-primario underline">
                Escríbanos o llámenos
              </Link>
              .
            </p>
          </section>
        )
      }
    />
  );
}
