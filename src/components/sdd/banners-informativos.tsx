"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { EnlaceExterno } from "./enlace-externo";
import { IconoChevron } from "./iconos";

export type BannerInformativo = {
  id: string | number;
  titulo: string;
  enlace?: string | null;
  textoEnlace?: string | null;
  imagen: { url: string; alt: string; width: number; height: number } | null;
};

/**
 * Banners informativos de la portada (A2 3.02.e.ii.a), uno a la vez con flechas e indicadores,
 * como en hacienda.gob.do. No avanzan solos: cambian solo cuando la persona lo pide (A2 7.01.w).
 */
export function BannersInformativos({ banners }: { banners: BannerInformativo[] }) {
  const [actual, setActual] = useState(0);
  const id = useId();
  const total = banners.length;
  const ir = (i: number) => setActual(((i % total) + total) % total);
  const flecha =
    "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-primario text-primario hover:bg-primario-claro";

  return (
    <div role="group" aria-roledescription="carrusel" aria-label="Banners informativos" className="flex items-center gap-3" data-banners>
      {total > 1 && (
        <button type="button" aria-controls={id} onClick={() => ir(actual - 1)} className={`${flecha} hidden sm:flex`}>
          <IconoChevron width={20} height={20} className="rotate-90" />
          <span className="sr-only">Banner anterior</span>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div id={id} aria-live="polite">
          {banners.map((b, i) => (
            <div key={b.id} role="group" aria-roledescription="banner" aria-label={`${i + 1} de ${total}`} hidden={i !== actual}>
              <Banner banner={b} />
            </div>
          ))}
        </div>
        {total > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1">
            <button type="button" aria-controls={id} onClick={() => ir(actual - 1)} className={`${flecha} sm:hidden`}>
              <IconoChevron width={20} height={20} className="rotate-90" />
              <span className="sr-only">Banner anterior</span>
            </button>
            {/* Los indicadores no caben en móvil con el texto al 200 % (A2 7.01.u): ahí bastan las flechas. */}
            <ul className="hidden items-center gap-1 sm:flex">
              {banners.map((b, i) => (
                <li key={b.id}>
                  <button
                    type="button"
                    aria-controls={id}
                    aria-current={i === actual ? "true" : undefined}
                    onClick={() => ir(i)}
                    className="flex size-11 cursor-pointer items-center justify-center"
                  >
                    <span aria-hidden className={`block size-3 rounded-full ${i === actual ? "bg-primario" : "border-2 border-primario"}`} />
                    <span className="sr-only">
                      Ir al banner {i + 1}: {b.titulo}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" aria-controls={id} onClick={() => ir(actual + 1)} className={`${flecha} sm:hidden`}>
              <IconoChevron width={20} height={20} className="-rotate-90" />
              <span className="sr-only">Banner siguiente</span>
            </button>
          </div>
        )}
      </div>
      {total > 1 && (
        <button type="button" aria-controls={id} onClick={() => ir(actual + 1)} className={`${flecha} hidden sm:flex`}>
          <IconoChevron width={20} height={20} className="-rotate-90" />
          <span className="sr-only">Banner siguiente</span>
        </button>
      )}
    </div>
  );
}

function Banner({ banner }: { banner: BannerInformativo }) {
  const contenido = (
    <>
      {banner.imagen && (
        <Image
          src={banner.imagen.url}
          alt={banner.imagen.alt}
          width={banner.imagen.width}
          height={banner.imagen.height}
          sizes="(min-width: 1320px) 1180px, 100vw"
          className="h-auto w-full"
        />
      )}
      <span className="flex flex-wrap items-center justify-between gap-2 bg-superficie px-4 py-3">
        <span className="font-semibold text-titulo">{banner.titulo}</span>
        {banner.enlace && <span className="font-semibold text-primario underline underline-offset-2">{banner.textoEnlace}</span>}
      </span>
    </>
  );
  const clase = "block overflow-hidden rounded-lg border border-borde hover:border-primario";
  if (!banner.enlace) return <div className={clase}>{contenido}</div>;
  return banner.enlace.startsWith("/") ? (
    <Link href={banner.enlace} className={clase}>
      {contenido}
    </Link>
  ) : (
    <EnlaceExterno href={banner.enlace} className={clase}>
      {contenido}
    </EnlaceExterno>
  );
}
