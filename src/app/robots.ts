import type { MetadataRoute } from "next";
import { urlSitio } from "@/config";

export const dynamic = "force-dynamic";

/**
 * robots.txt: todo el portal es indexable salvo el panel, los resultados del buscador y las
 * exportaciones; los documentos y las imágenes publicadas sí se indexan (A2 6.01).
 */
export default function robots(): MetadataRoute.Robots {
  const base = urlSitio().toString().replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/documentos/file/", "/api/medios/file/"],
      disallow: ["/gestion", "/auth/", "/api/", "/buscar", "/exportar-pdf", "/acceso-denegado", "/estadisticas/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
