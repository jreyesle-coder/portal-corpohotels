import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Descarga } from "@/components/sdd/descarga";
import { type EnlaceSeccion, PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import type { Miga } from "@/components/sdd/rastro-navegacion";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import type { Documento } from "@/payload-types";
import { comoMedio, obtenerMenu, obtenerPagina } from "./datos";

type Seo = { titulo?: string | null; descripcion?: string | null; noIndexar?: boolean | null } | null | undefined;

/** Título y meta descripción propios de cada página (A2 6.01.d–e); NoIndex por página (6.01.j). */
export function metadatos(titulo: string, seo: Seo, resumen?: string | null): Metadata {
  return {
    title: seo?.titulo || titulo,
    description: seo?.descripcion || resumen || undefined,
    robots: seo?.noIndexar ? { index: false } : undefined,
  };
}

export async function metadatosPagina(slug: string): Promise<Metadata> {
  const p = await obtenerPagina(slug);
  return p ? metadatos(p.titulo, p.seo) : {};
}

/** Navegación lateral de «Sobre nosotros», tomada del menú principal del CMS. */
export async function seccionSobreNosotros(rutaActual: string): Promise<{ titulo: string; enlaces: EnlaceSeccion[] }> {
  const menu = await obtenerMenu("principal");
  const item = menu.find((m) => m.href === "/sobre-nosotros");
  return {
    titulo: item?.etiqueta ?? "Sobre nosotros",
    enlaces: (item?.hijos ?? []).map((h) => ({ ...h, activo: h.href === rutaActual })),
  };
}

/** Página institucional administrada en el CMS (colección «Páginas»). */
export async function PaginaCms({
  slug,
  migas,
  seccion,
  despues,
}: {
  slug: string;
  migas: Miga[];
  seccion?: { titulo: string; enlaces: EnlaceSeccion[] };
  despues?: React.ReactNode;
}) {
  const pagina = await obtenerPagina(slug);
  if (!pagina) notFound();
  const imagen = comoMedio(pagina.imagen);
  const documentos = (pagina.documentos ?? []).filter((d): d is Documento => typeof d === "object" && d !== null);
  return (
    <PlantillaPagina
      titulo={pagina.titulo}
      migas={[...migas, { etiqueta: pagina.titulo }]}
      seccion={seccion}
      urlPdf={`/exportar-pdf?tipo=paginas&slug=${pagina.slug}`}
    >
      {imagen?.url && (
        <figure className="mb-6 max-w-md">
          <Image
            src={imagen.url}
            alt={imagen.alt}
            width={imagen.width ?? 800}
            height={imagen.height ?? 600}
            className="h-auto w-full rounded-lg"
            sizes="(min-width: 800px) 28rem, 100vw"
          />
        </figure>
      )}
      <TextoEnriquecido datos={pagina.contenido} />
      {documentos.length > 0 && (
        <section aria-labelledby="descargas" className="mt-8 max-w-3xl space-y-3">
          <h2 id="descargas" className="text-xl font-semibold text-titulo">
            Descargas
          </h2>
          {documentos.map((d) => (
            <Descarga key={d.id} documento={d} />
          ))}
        </section>
      )}
      {despues}
    </PlantillaPagina>
  );
}
