import type { Metadata } from "next";
import { metadatosPagina, PaginaCms } from "@/sitio/pagina-cms";

export const generateMetadata = (): Promise<Metadata> => metadatosPagina("transparencia");

/** Transparencia (A2 5.01.b). La estructura completa de la DIGEIG se integra en S4. */
export default function Transparencia() {
  return <PaginaCms slug="transparencia" migas={[]} />;
}
