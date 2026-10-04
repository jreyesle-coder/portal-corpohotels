import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarDestino } from "@/contenido/transparencia";
import { PaginaDestino } from "@/sitio/transparencia";

type Props = { params: Promise<{ seccion: string; subseccion: string }>; searchParams: Promise<{ anio?: string }> };

async function destinoDe(params: Props["params"]) {
  const { seccion, subseccion } = await params;
  const d = buscarDestino(`${seccion}/${subseccion}`);
  return d?.subseccion ? d : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await destinoDe(params);
  return d
    ? {
        title: `${d.titulo} | ${d.seccion.titulo}`,
        // Descripción propia de cada subsección (A2 6.01.e).
        description: `${d.titulo}: información de transparencia de CORPHOTELS en ${d.seccion.titulo}.`,
      }
    : {};
}

/** Subsección de transparencia con sus documentos. */
export default async function Subseccion({ params, searchParams }: Props) {
  const destino = await destinoDe(params);
  if (!destino) notFound();
  return <PaginaDestino destino={destino} anio={(await searchParams).anio} />;
}
