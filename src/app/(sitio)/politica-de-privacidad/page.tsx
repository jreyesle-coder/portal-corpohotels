import type { Metadata } from "next";
import { metadatosPagina, PaginaCms } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("politica-de-privacidad");

export default function PoliticaDePrivacidad() {
  return <PaginaCms slug="politica-de-privacidad" migas={[]} />;
}
