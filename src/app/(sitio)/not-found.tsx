import type { Metadata } from "next";
import { PaginaNoEncontrada } from "@/components/sdd/pagina-no-encontrada";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 para contenido inexistente dentro de una sección (p. ej., una noticia que no existe). */
export default function NoEncontrada() {
  return <PaginaNoEncontrada />;
}
