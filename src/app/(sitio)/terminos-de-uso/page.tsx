import type { Metadata } from "next";
import { metadatosPagina, PaginaCms } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("terminos-de-uso");

export default function TerminosDeUso() {
  return <PaginaCms slug="terminos-de-uso" migas={[]} />;
}
