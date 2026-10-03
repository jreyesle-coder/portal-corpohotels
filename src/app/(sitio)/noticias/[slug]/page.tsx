import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { fechaLarga } from "@/components/sdd/tarjeta-noticia";
import { TextoEnriquecido } from "@/components/sdd/texto-enriquecido";
import { comoMedio, obtenerNoticia } from "@/sitio/datos";
import { metadatos } from "@/sitio/pagina-cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await obtenerNoticia((await params).slug);
  return n ? metadatos(n.titulo, n.seo, n.resumen) : {};
}

/** Noticia: título, fecha, lugar, imagen y fuente al final con enlace directo (A2 4.02, 4.01.d–e). */
export default async function Noticia({ params }: Props) {
  const noticia = await obtenerNoticia((await params).slug);
  if (!noticia) notFound();
  const imagen = comoMedio(noticia.imagen);
  const variante = imagen?.sizes?.completa?.url ? imagen.sizes.completa : imagen;
  const fuente = noticia.fuente;

  return (
    <PlantillaPagina
      titulo={noticia.titulo}
      migas={[{ etiqueta: "Noticias", href: "/noticias" }, { etiqueta: noticia.titulo }]}
      urlPdf={`/exportar-pdf?tipo=noticias&slug=${noticia.slug}`}
      antesDelTitulo={
        <p className="mb-2 text-sm text-texto-suave">
          <time dateTime={noticia.fecha}>{fechaLarga(noticia.fecha)}</time> · {noticia.lugar}
        </p>
      }
    >
      {variante?.url && (
        <figure className="mb-6 max-w-3xl">
          <Image
            src={variante.url}
            alt={imagen?.alt ?? ""}
            width={variante.width ?? 1600}
            height={variante.height ?? 900}
            className="h-auto w-full rounded-lg"
            sizes="(min-width: 800px) 48rem, 100vw"
            priority
          />
          {imagen?.credito && <figcaption className="mt-1 text-sm text-texto-suave">Foto: {imagen.credito}</figcaption>}
        </figure>
      )}
      <TextoEnriquecido datos={noticia.contenido} />
      {fuente?.nombre && (
        <p className="mt-8 max-w-3xl border-t border-borde pt-4 text-sm">
          <strong>Fuente:</strong>{" "}
          {fuente.url ? (
            <EnlaceExterno href={fuente.url} className="text-primario underline underline-offset-2">
              {fuente.nombre}
            </EnlaceExterno>
          ) : (
            fuente.nombre
          )}
        </p>
      )}
    </PlantillaPagina>
  );
}
