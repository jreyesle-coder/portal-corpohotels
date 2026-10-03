"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { type EnlaceMenu, menuPrincipal } from "@/contenido/sitio";
import { IconoChevron } from "./iconos";
import { useCerrarFuera } from "./use-cerrar-fuera";

export function esActivo(href: string, ruta: string) {
  return href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
}

export function ramaActiva(item: EnlaceMenu, ruta: string): boolean {
  return esActivo(item.href, ruta) || (item.hijos?.some((h) => ramaActiva(h, ruta)) ?? false);
}

/**
 * Menú principal horizontal de escritorio, 56 px de alto (A2 3.02.b, 3.02.g).
 * Resalta la sección activa (2.01.b.i) e indica gráficamente los submenús de nivel II (3.01.b.viii).
 */
export function MenuPrincipal() {
  const ruta = usePathname();
  return (
    <nav aria-label="Menú principal" className="hidden border-t border-borde bg-fondo esc:block">
      <ul className="contenedor flex h-[56px] items-stretch gap-1" data-medida="menu-principal">
        {menuPrincipal.map((item) =>
          item.hijos ? (
            <ItemConSubmenu key={item.href} item={item} ruta={ruta} />
          ) : (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={esActivo(item.href, ruta) ? "page" : undefined}
                className={claseItem(esActivo(item.href, ruta))}
              >
                {item.etiqueta}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

const claseItem = (activo: boolean) =>
  `flex cursor-pointer items-center gap-1 border-b-[3px] px-3 text-[0.9375rem] transition-colors hover:text-primario ${
    activo ? "border-primario font-semibold text-primario" : "border-transparent text-texto"
  }`;

function ItemConSubmenu({ item, ruta }: { item: EnlaceMenu; ruta: string }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLLIElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idSubmenu = useId();
  const cerrar = useCallback(() => setAbierto(false), []);
  useCerrarFuera(abierto, contenedor, cerrar, boton);

  return (
    <li
      ref={contenedor}
      className="relative flex"
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idSubmenu}
        onClick={() => setAbierto((v) => !v)}
        className={claseItem(ramaActiva(item, ruta))}
      >
        {item.etiqueta}
        <IconoChevron width={16} height={16} className={abierto ? "rotate-180" : ""} />
      </button>
      <ul
        id={idSubmenu}
        hidden={!abierto}
        className="absolute top-full left-0 z-40 min-w-64 rounded-b-md border border-borde bg-fondo py-2 shadow-lg"
      >
        {item.hijos!.map((hijo) => {
          const activo = esActivo(hijo.href, ruta);
          return (
            <li key={hijo.href}>
              <Link
                href={hijo.href}
                aria-current={activo ? "page" : undefined}
                onClick={cerrar}
                className={`block border-l-[3px] px-4 py-2 text-[0.9375rem] hover:bg-primario-claro hover:text-primario ${
                  activo ? "border-primario font-semibold text-primario" : "border-transparent text-texto"
                }`}
              >
                {hijo.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
