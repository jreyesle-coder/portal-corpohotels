import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { urlSitio } from "@/config";
import { organismo } from "@/contenido/sitio";
import { MarcoPortal } from "@/components/sdd/marco-portal";
import "../globals.css";

/**
 * Metadatos comunes (A2 6.01): título «Página | Sitio | palabras clave» (6.01.d; la portada lleva
 * solo el nombre oficial, 7.01.m), descripción de respaldo y dirección canónica de cada página
 * (6.01.g.iii), que calcula el proxy. Cada página define su propio título y descripción.
 */
export async function generateMetadata(): Promise<Metadata> {
  const canonica = (await headers()).get("x-ruta-canonica");
  return { ...metadata, alternates: canonica ? { canonical: canonica } : undefined };
}

const metadata: Metadata = {
  metadataBase: urlSitio(),
  title: {
    default: organismo.tituloPortada,
    template: `%s | ${organismo.siglas} | Fomento hotelero y turístico`,
  },
  description:
    "Portal oficial de la Corporación de Fomento de la Industria Hotelera y Desarrollo del Turismo (CORPHOTELS): servicios, noticias, transparencia y contactos.",
  applicationName: organismo.siglas,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/iconos/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/iconos/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.webmanifest",
};

// El contenido viene del CMS en cada solicitud; la imagen Docker se compila sin base de datos.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#0f539c",
};

export default function DisenoSitio({ children }: { children: React.ReactNode }) {
  return <MarcoPortal>{children}</MarcoPortal>;
}
