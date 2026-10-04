import type { Metadata } from "next";
import { organismo } from "@/contenido/sitio";
import { MarcoPortal } from "@/components/sdd/marco-portal";
import { PaginaNoEncontrada } from "@/components/sdd/pagina-no-encontrada";
import "./globals.css";

export const metadata: Metadata = {
  title: `Página no encontrada | ${organismo.siglas} | Fomento hotelero y turístico`,
  icons: { icon: [{ url: "/favicon.ico", sizes: "16x16 32x32 48x48" }] },
};

/**
 * 404 de toda ruta sin página, con el diseño completo del portal (A2 2.01.b.xii). Se usa
 * global-not-found porque el portal y el panel del CMS tendrán layouts raíz distintos (S1).
 */
export default function NoEncontradaGlobal() {
  return (
    <MarcoPortal>
      <PaginaNoEncontrada />
    </MarcoPortal>
  );
}
