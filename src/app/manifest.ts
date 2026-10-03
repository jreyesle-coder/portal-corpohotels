import type { MetadataRoute } from "next";
import { organismo } from "@/contenido/sitio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: organismo.tituloPortada,
    short_name: organismo.siglas,
    lang: "es",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0f539c",
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
