import type { Metadata, Viewport } from "next";
import { urlSitio } from "@/config";
import { organismo } from "@/contenido/sitio";
import { MarcoPortal } from "@/components/sdd/marco-portal";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: urlSitio(),
  title: {
    default: organismo.tituloPortada,
    template: `%s | ${organismo.siglas}`,
  },
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
