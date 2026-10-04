import type { MetadataRoute } from "next";
import { urlSitio } from "@/config";
import { informate, menuPrincipal } from "@/contenido/sitio";
import { RUTAS_TRANSPARENCIA } from "@/contenido/transparencia";
import { contenidoIndexable } from "@/sitio/datos";

// Se genera en cada solicitud con lo publicado en el CMS.
export const dynamic = "force-dynamic";

/** sitemap.xml con todas las páginas indexables del portal (A2 6.01.i.iii). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio().toString().replace(/\/$/, "");
  const { noticias, servicios, sobreNosotros } = await contenidoIndexable();
  const fijas = new Set<string>([
    ...menuPrincipal.flatMap((m) => [m.href, ...(m.hijos ?? []).map((h) => h.href)]),
    ...informate.map((i) => i.href),
    "/contactos/sugerencias",
    "/mapa-del-sitio",
    ...RUTAS_TRANSPARENCIA,
  ]);
  return [
    ...[...fijas].map((ruta) => ({ url: base + ruta, changeFrequency: "monthly" as const, priority: ruta === "/" ? 1 : 0.6 })),
    ...sobreNosotros.map((p) => ({ url: `${base}/sobre-nosotros/${p.slug}`, lastModified: p.updatedAt })),
    ...servicios.map((s) => ({ url: `${base}/servicios/${s.slug}`, lastModified: s.updatedAt, priority: 0.8 })),
    ...noticias.map((n) => ({ url: `${base}/noticias/${n.slug}`, lastModified: n.updatedAt })),
  ].filter((e, i, todas) => todas.findIndex((x) => x.url === e.url) === i);
}
