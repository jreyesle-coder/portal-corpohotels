import Image from "next/image";
import Link from "next/link";
import { organismo } from "@/contenido/sitio";
import { FormularioBusqueda } from "./buscador";
import { EnlacesInteres } from "./enlaces-interes";
import { MenuPrincipal } from "./menu-principal";
import { ControlesMovil } from "./menu-movil";

/**
 * Cabecera institucional (A2 3.02.a–b escritorio, 3.04.a móvil).
 * Fija en la parte superior junto al menú principal (3.01.b.vii). Solo contiene: logo,
 * nombre del organismo, buscador, enlaces de interés y menú principal.
 */
export function Cabecera({ opcion }: { opcion: "A" | "B" }) {
  const oscura = opcion === "B";
  return (
    <header className="sticky top-0 z-40 shadow-sm" data-cabecera>
      <div className={`relative ${oscura ? "bg-primario text-sobre-primario" : "bg-fondo text-primario"}`}>
        <div className="contenedor flex h-[72px] items-center justify-between gap-4 esc:h-[82px]">
          {/* Logo y nombre enlazan al inicio (A2 2.01.d). */}
          <Link href="/" className="flex min-w-0 items-center gap-3" data-medida="logo-enlace">
            <Image
              src={oscura ? "/brand/icono-blanco.svg" : "/brand/icono-azul.svg"}
              alt=""
              width={44}
              height={44}
              priority
              className="size-[44px] esc:size-[40px]"
              data-medida="logo"
            />
            <span className="min-w-0 text-[0.8125rem] leading-tight font-semibold esc:max-w-[26rem] esc:text-[0.9375rem]">
              {organismo.nombre} <span className="whitespace-nowrap">({organismo.siglas})</span>
              <span className="sr-only">, ir al inicio</span>
            </span>
          </Link>

          <div className="hidden items-center gap-4 esc:flex">
            <FormularioBusqueda id="busqueda-cabecera" />
            <span aria-hidden className="h-8 w-px bg-borde" />
            <EnlacesInteres />
          </div>

          <ControlesMovil />
        </div>
      </div>
      <MenuPrincipal />
    </header>
  );
}
