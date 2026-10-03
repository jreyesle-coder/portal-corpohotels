import type { Metadata } from "next";
import Link from "next/link";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { listarServicios } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios que ofrece CORPHOTELS a la ciudadanía y a los arrendatarios de las propiedades turísticas del Estado.",
};

/** Catálogo de servicios (A2 4.02). La ficha completa de la NORTIC A5 llega en S3. */
export default async function Servicios() {
  const servicios = await listarServicios();
  return (
    <PlantillaPagina titulo="Servicios" migas={[{ etiqueta: "Servicios" }]}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {servicios.map((s) => (
          <li key={s.id} className="rounded-lg border border-borde bg-superficie p-5">
            <h2 className="mb-2 text-lg font-semibold">
              <Link href={`/servicios/${s.slug}`} className="text-primario underline-offset-2 hover:underline">
                {s.nombre}
              </Link>
            </h2>
            <p className="text-sm">{s.resumen}</p>
          </li>
        ))}
      </ul>
    </PlantillaPagina>
  );
}
