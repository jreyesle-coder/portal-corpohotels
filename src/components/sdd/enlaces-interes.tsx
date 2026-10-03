"use client";

import { useCallback, useId, useRef, useState } from "react";
import { enlacesInteres } from "@/contenido/sitio";
import { EnlaceExterno } from "./enlace-externo";
import { IconoCerrar, IconoCuadricula } from "./iconos";
import { useCerrarFuera } from "./use-cerrar-fuera";

/** Secciones Ventanillas, Portales e Instituciones en cuadrícula (A2 4.01.c, Figura 3.4). */
export function ListaEnlacesInteres({ tono = "claro" }: { tono?: "claro" | "oscuro" }) {
  const titulo = tono === "claro" ? "text-titulo border-borde" : "text-sobre-primario border-sobre-primario/40";
  const texto = tono === "claro" ? "text-texto" : "text-sobre-primario";
  return (
    <div className="space-y-5">
      {enlacesInteres.map(({ seccion, enlaces }) => (
        <section key={seccion} aria-label={seccion}>
          <h3 className={`mb-3 border-b pb-1 text-sm font-semibold ${titulo}`}>{seccion}</h3>
          <ul className="grid grid-cols-3 gap-x-2 gap-y-4">
            {enlaces.map((e) => (
              <li key={e.url}>
                <EnlaceExterno
                  href={e.url}
                  className={`group flex flex-col items-center gap-1.5 rounded text-center text-[11px] leading-tight ${texto}`}
                >
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full border border-primario/30 bg-fondo text-[11px] font-bold text-primario group-hover:border-primario"
                  >
                    {e.siglas}
                  </span>
                  <span className="group-hover:underline">{e.nombre}</span>
                </EnlaceExterno>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Menú en cuadrícula desplegable de enlaces de interés, disparador de 32×32 px (A2 3.02.b). */
export function EnlacesInteres() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idPanel = useId();
  const cerrar = useCallback(() => setAbierto(false), []);
  useCerrarFuera(abierto, contenedor, cerrar, boton);

  return (
    <div ref={contenedor} className="relative">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((v) => !v)}
        className="flex size-[32px] cursor-pointer items-center justify-center rounded text-primario hover:bg-primario-claro"
        data-medida="enlaces-interes"
      >
        <IconoCuadricula width={24} height={24} />
        <span className="sr-only">Enlaces de interés</span>
      </button>

      <div
        id={idPanel}
        hidden={!abierto}
        className="absolute top-full right-0 z-50 mt-2 w-[360px] rounded-lg border border-borde bg-superficie shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-borde px-4 py-3">
          <h2 className="text-base font-semibold text-titulo">Enlaces de interés</h2>
          <button
            type="button"
            onClick={() => {
              cerrar();
              boton.current?.focus();
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-titulo hover:bg-primario-claro"
          >
            <IconoCerrar width={20} height={20} />
            <span className="sr-only">Cerrar enlaces de interés</span>
          </button>
        </div>
        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-4 py-4">
          <ListaEnlacesInteres />
        </div>
      </div>
    </div>
  );
}
