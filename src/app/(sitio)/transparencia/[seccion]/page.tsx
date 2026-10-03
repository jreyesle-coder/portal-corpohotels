import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarDestino, buscarSeccion } from "@/contenido/transparencia";
import { PaginaDestino, PaginaSeccion } from "@/sitio/transparencia";

type Props = { params: Promise<{ seccion: string }>; searchParams: Promise<{ anio?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = buscarSeccion((await params).seccion);
  return s ? { title: `${s.titulo} | Transparencia`, description: s.descripcion } : {};
}

/** Sección de transparencia: con subsecciones, su menú de archivos; sin ellas, sus documentos. */
export default async function Seccion({ params, searchParams }: Props) {
  const clave = (await params).seccion;
  const seccion = buscarSeccion(clave);
  // Las rutas inexistentes las descarta antes el proxy con el 404 institucional.
  if (!seccion) notFound();
  if (seccion.subsecciones?.length) return <PaginaSeccion seccion={seccion} />;
  return <PaginaDestino destino={buscarDestino(clave)!} anio={(await searchParams).anio} />;
}
