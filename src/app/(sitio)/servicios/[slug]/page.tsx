import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import { obtenerServicio } from "@/sitio/datos";
import { metadatos } from "@/sitio/pagina-cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await obtenerServicio((await params).slug);
  return s ? metadatos(s.nombre, s.seo, s.resumen) : {};
}

/** Detalle de un servicio. En S3 se presenta como la ficha de 15 campos de la NORTIC A5. */
export default async function Servicio({ params }: Props) {
  const servicio = await obtenerServicio((await params).slug);
  if (!servicio) notFound();
  return (
    <PlantillaPagina
      titulo={servicio.nombre}
      migas={[{ etiqueta: "Servicios", href: "/servicios" }, { etiqueta: servicio.nombre }]}
      urlPdf={`/exportar-pdf?tipo=servicios&slug=${servicio.slug}`}
    >
      <p className="mb-6 max-w-3xl text-lg">{servicio.resumen}</p>
      <TextoEnriquecido datos={servicio.contenido} />
    </PlantillaPagina>
  );
}
