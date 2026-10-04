"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState, useSyncExternalStore } from "react";
import { EnlaceExterno } from "./enlace-externo";
import { IconoChevron } from "./iconos";

export type Diapositiva = {
  id: string | number;
  titulo: string;
  imagen: { url: string; alt: string; width: number; height: number } | null;
  enlace?: string | null;
  textoBoton?: string | null;
};

const consultaMovimiento = "(prefers-reduced-motion: reduce)";
function useMovimientoReducido() {
  return useSyncExternalStore(
    (avisar) => {
      const m = window.matchMedia(consultaMovimiento);
      m.addEventListener("change", avisar);
      return () => m.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consultaMovimiento).matches,
    () => true,
  );
}

/**
 * Carrusel principal de la portada, a todo lo ancho (como hacienda.gob.do). Patrón de carrusel de
 * la WAI-ARIA: botón de pausa (WCAG 2.2.2), anterior y siguiente, indicadores, pausa al pasar el
 * mouse o al recibir el foco, y sin avance para quien pidió reducir el movimiento. El avance
 * automático se apaga en el CMS (novedad N-34, A2 7.01.w).
 */
export function Carrusel({
  diapositivas,
  automatico,
  segundos,
  etiqueta,
}: {
  diapositivas: Diapositiva[];
  automatico: boolean;
  segundos: number;
  etiqueta: string;
}) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [suspendido, setSuspendido] = useState(false);
  const movimientoReducido = useMovimientoReducido();
  const id = useId();
  const total = diapositivas.length;
  const avanzando = automatico && !pausado && !suspendido && !movimientoReducido && total > 1;

  const ir = useCallback((i: number) => setActual(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (!avanzando) return;
    const t = window.setTimeout(() => ir(actual + 1), segundos * 1000);
    return () => window.clearTimeout(t);
  }, [avanzando, actual, segundos, ir]);

  if (total === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      className="relative bg-oscuro text-sobre-oscuro"
      data-carrusel
      onMouseEnter={() => setSuspendido(true)}
      onMouseLeave={() => setSuspendido(false)}
      onFocus={() => setSuspendido(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSuspendido(false);
      }}
    >
      {/* Mientras avanza solo, el lector de pantalla no anuncia cada cambio (patrón WAI-ARIA). */}
      <div id={id} aria-live={avanzando ? "off" : "polite"} className="relative h-[26rem] esc:h-[34rem]">
        {diapositivas.map((d, i) => (
          <div
            key={d.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}`}
            hidden={i !== actual}
            className="absolute inset-0"
            data-diapositiva
          >
            {d.imagen && (
              <Image
                src={d.imagen.url}
                alt={d.imagen.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden />
            <div className="contenedor relative flex h-full flex-col justify-end pb-20 esc:pb-28">
              <p className="line-clamp-4 max-w-4xl text-xl leading-tight font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)] esc:line-clamp-none esc:text-4xl">
                {d.titulo}
              </p>
              {d.enlace && <Boton diapositiva={d} />}
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="contenedor absolute inset-x-0 bottom-4 flex items-center gap-2 esc:bottom-5 esc:gap-3">
          {automatico && !movimientoReducido && (
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-white/80 text-white hover:bg-white/15"
              data-carrusel-pausa
            >
              {pausado ? <IconoReproducir /> : <IconoPausa />}
              <span className="sr-only">{pausado ? "Reanudar el carrusel" : "Pausar el carrusel"}</span>
            </button>
          )}
          <button
            type="button"
            aria-controls={id}
            onClick={() => ir(actual - 1)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-white/80 text-white hover:bg-white/15"
          >
            <IconoChevron width={20} height={20} className="rotate-90" />
            <span className="sr-only">Diapositiva anterior</span>
          </button>
          <button
            type="button"
            aria-controls={id}
            onClick={() => ir(actual + 1)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-white/80 text-white hover:bg-white/15"
          >
            <IconoChevron width={20} height={20} className="-rotate-90" />
            <span className="sr-only">Diapositiva siguiente</span>
          </button>
          {/* En pantallas angostas bastan las flechas: los indicadores no caben con el texto al 200 % (A2 7.01.u). */}
          <ul className="ml-1 hidden min-w-0 items-center sm:flex esc:ml-2 esc:gap-1">
            {diapositivas.map((d, i) => (
              <li key={d.id}>
                <button
                  type="button"
                  aria-controls={id}
                  aria-current={i === actual ? "true" : undefined}
                  onClick={() => ir(i)}
                  className="flex h-11 w-7 cursor-pointer items-center px-0.5 esc:w-10"
                >
                  <span aria-hidden className={`block h-1 w-full rounded ${i === actual ? "bg-acento" : "bg-white/70"}`} />
                  <span className="sr-only">
                    Ir a la diapositiva {i + 1}: {d.titulo}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Boton({ diapositiva: d }: { diapositiva: Diapositiva }) {
  const clase =
    // Blanco sobre el rojo de marca da 4.3:1: solo cumple como texto grande en negrita (≥ 14 pt, WCAG 1.4.3).
    "mt-4 inline-flex min-h-11 w-fit items-center rounded-md bg-acento px-5 text-[1.1875rem] font-bold text-sobre-acento hover:brightness-110";
  const texto = (
    <>
      {d.textoBoton || "Leer más"}
      <span className="sr-only">: {d.titulo}</span>
    </>
  );
  return d.enlace!.startsWith("/") ? (
    <Link href={d.enlace!} className={clase}>
      {texto}
    </Link>
  ) : (
    <EnlaceExterno href={d.enlace!} className={clase}>
      {texto}
    </EnlaceExterno>
  );
}

const IconoPausa = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden focusable={false}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

const IconoReproducir = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden focusable={false}>
    <path d="M8 5v14l11-7z" />
  </svg>
);
