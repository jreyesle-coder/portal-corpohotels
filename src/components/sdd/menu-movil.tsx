"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { type EnlaceMenu, menuPrincipal } from "@/contenido/sitio";
import { FormularioBusqueda } from "./buscador";
import { ListaEnlacesInteres } from "./enlaces-interes";
import { IconoCerrar, IconoChevron, IconoCuadricula, IconoLupa, IconoMenu } from "./iconos";
import { esActivo, ramaActiva } from "./menu-principal";

/**
 * Controles de la cabecera móvil (A2 3.04.a): búsqueda de 28×28 px y menú hamburguesa de 42×44 px,
 * desplegado hacia abajo con los enlaces de interés (Figura 3.20) y submenús hasta el nivel II.
 * Los paneles se despliegan en la página, sin vistas modales (A2 2.02.a).
 */
export function ControlesMovil() {
  const ruta = usePathname();
  const [panel, setPanel] = useState<"menu" | "buscar" | null>(null);
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setPanel(null);
  }
  const idMenu = useId();
  const idBuscar = useId();
  const alternar = (p: "menu" | "buscar") => setPanel((v) => (v === p ? null : p));

  return (
    <div className="flex items-center gap-3 esc:hidden">
      <button
        type="button"
        aria-expanded={panel === "buscar"}
        aria-controls={idBuscar}
        onClick={() => alternar("buscar")}
        className="flex size-[28px] cursor-pointer items-center justify-center rounded-full bg-acento text-sobre-acento"
        data-medida="buscar-movil"
      >
        <IconoLupa width={16} height={16} strokeWidth={2.5} />
        <span className="sr-only">Buscar en el portal</span>
      </button>
      <span aria-hidden className="h-8 w-px bg-borde" />
      <button
        type="button"
        aria-expanded={panel === "menu"}
        aria-controls={idMenu}
        onClick={() => alternar("menu")}
        className={`flex h-[44px] w-[42px] cursor-pointer items-center justify-center rounded ${
          panel === "menu" ? "bg-primario text-sobre-primario" : "text-titulo"
        }`}
        data-medida="hamburguesa"
      >
        {panel === "menu" ? <IconoCerrar width={26} height={26} /> : <IconoMenu width={26} height={26} />}
        <span className="sr-only">Menú</span>
      </button>

      <div id={idBuscar} hidden={panel !== "buscar"} className="absolute inset-x-0 top-full border-b border-borde bg-fondo py-3 shadow-md">
        <div className="contenedor">
          <FormularioBusqueda id="busqueda-movil" ancho="completo" />
        </div>
      </div>

      <nav
        id={idMenu}
        hidden={panel !== "menu"}
        aria-label="Menú principal"
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto bg-primario pb-6 text-sobre-primario shadow-md"
      >
        <div className="contenedor">
          <Desplegable
            etiqueta={
              <>
                <IconoCuadricula width={18} height={18} /> Enlaces de interés
              </>
            }
          >
            <div className="pt-2 pb-4">
              <ListaEnlacesInteres tono="oscuro" />
            </div>
          </Desplegable>
          <ul>
            {menuPrincipal.map((item) => (
              <ItemMovil key={item.href} item={item} ruta={ruta} />
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

function ItemMovil({ item, ruta }: { item: EnlaceMenu; ruta: string }) {
  if (!item.hijos) {
    const activo = esActivo(item.href, ruta);
    return (
      <li className="border-b border-sobre-primario/25">
        <Link
          href={item.href}
          aria-current={activo ? "page" : undefined}
          className={`block py-3 ${activo ? "font-semibold underline underline-offset-4" : ""}`}
        >
          {item.etiqueta}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <Desplegable etiqueta={item.etiqueta} activo={ramaActiva(item, ruta)}>
        <ul className="pb-2 pl-4">
          {item.hijos.map((hijo) => {
            const activo = esActivo(hijo.href, ruta);
            return (
              <li key={hijo.href}>
                <Link
                  href={hijo.href}
                  aria-current={activo ? "page" : undefined}
                  className={`block py-2 ${activo ? "font-semibold underline underline-offset-4" : ""}`}
                >
                  {hijo.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </Desplegable>
    </li>
  );
}

function Desplegable({
  etiqueta,
  activo = false,
  children,
}: {
  etiqueta: React.ReactNode;
  activo?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(activo);
  const id = useId();
  return (
    <div className="border-b border-sobre-primario/25">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 py-3 text-left ${activo ? "font-semibold" : ""}`}
      >
        <span className="flex items-center gap-2">{etiqueta}</span>
        <IconoChevron width={18} height={18} className={abierto ? "rotate-180" : ""} />
      </button>
      <div id={id} hidden={!abierto}>
        {children}
      </div>
    </div>
  );
}
