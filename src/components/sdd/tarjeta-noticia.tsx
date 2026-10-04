import Image from "next/image";
import Link from "next/link";
import type { Noticia } from "@/payload-types";
import { comoMedio } from "@/sitio/datos";

export const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Santo_Domingo" });

/** Tarjeta de noticia: título, fecha, lugar e imagen (A2 4.02). */
/** `destacada`: la primera tarjeta visible se carga con prioridad (mejor LCP, S7). */
export function TarjetaNoticia({ noticia, nivel = 3, destacada = false }: { noticia: Noticia; nivel?: 2 | 3; destacada?: boolean }) {
  const imagen = comoMedio(noticia.imagen);
  const Titulo = `h${nivel}` as const;
  const variante = imagen?.sizes?.tarjeta?.url ? imagen.sizes.tarjeta : imagen;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-fondo">
      {variante?.url && (
        <Image
          src={variante.url}
          alt={imagen?.alt ?? ""}
          width={variante.width ?? 800}
          height={variante.height ?? 450}
          className="aspect-video w-full object-cover"
          {...(destacada ? { fetchPriority: "high" as const, loading: "eager" as const } : {})}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-texto-suave">
          <time dateTime={noticia.fecha}>{fechaLarga(noticia.fecha)}</time> · {noticia.lugar}
        </p>
        <Titulo className="text-lg leading-snug font-semibold text-titulo">
          <Link href={`/noticias/${noticia.slug}`} className="hover:text-primario hover:underline">
            {noticia.titulo}
          </Link>
        </Titulo>
        <p className="line-clamp-3 text-sm text-texto">{noticia.resumen}</p>
      </div>
    </article>
  );
}
