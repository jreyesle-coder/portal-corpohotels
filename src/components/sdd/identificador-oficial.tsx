"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { IconoChevron } from "./iconos";

/**
 * Identificador Oficial del Estado Dominicano (A2 4.01.b, Figura 4.1).
 * Escritorio: 27 px cerrado y 150 px expandido (A2 3.02.b).
 * Opción A de cabecera → identificador azul; opción B → identificador blanco (A2 3.02.a).
 * No es fijo: al desplazar la página queda arriba y se oculta, mientras la cabecera
 * permanece fija (A2 3.01.b.vii, 2.02.b).
 */
export function IdentificadorOficial({ opcion }: { opcion: "A" | "B" }) {
  const [abierto, setAbierto] = useState(false);
  const idDetalle = useId();
  const azul = opcion === "A";
  const tono = azul ? "bg-oscuro text-sobre-oscuro" : "bg-fondo text-titulo shadow-[inset_0_-1px_0_var(--borde)]";

  return (
    <section aria-label="Identificador oficial del Gobierno" className={`${tono} text-[12px] leading-tight`} data-identificador>
      <div className="contenedor flex min-h-[27px] items-center gap-2 py-1 esc:h-[27px] esc:py-0">
        <Image src="/sdd/bandera-rd.png" alt="Bandera de la República Dominicana" width={18} height={12} loading="eager" />
        <p className="min-w-0 flex-1 esc:flex-none">Esta es una web oficial del Gobierno de la República Dominicana</p>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={idDetalle}
          onClick={() => setAbierto((v) => !v)}
          className="inline-flex min-h-6 shrink-0 cursor-pointer items-center gap-1 font-semibold underline underline-offset-2"
        >
          <span className="sr-only esc:not-sr-only">Así es como puedes saberlo</span>
          <IconoChevron width={16} height={16} className={abierto ? "rotate-180" : ""} />
        </button>
      </div>

      <div id={idDetalle} hidden={!abierto} className="border-t border-current/20">
        <div className="contenedor grid gap-4 py-3 esc:h-[122px] esc:grid-cols-2 esc:items-center esc:gap-10 esc:py-0">
          <Prueba icono="/sdd/cupula.svg" titulo="Los sitios web oficiales utilizan .gob.do, .gov.do o .mil.do" azul={azul}>
            Un sitio .gob.do, .gov.do o .mil.do significa que pertenece a una organización oficial del Estado dominicano.
          </Prueba>
          <Prueba icono="/sdd/lock.svg" titulo="Los sitios web oficiales .gob.do, .gov.do o .mil.do seguros usan HTTPS" azul={azul}>
            Un candado o https:// significa que estás conectado a un sitio seguro dentro de .gob.do o .gov.do. Comparte
            información confidencial solo en los sitios seguros de .gob.do o .gov.do.
          </Prueba>
        </div>
      </div>
    </section>
  );
}

function Prueba({
  icono,
  titulo,
  azul,
  children,
}: {
  icono: string;
  titulo: string;
  azul: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${azul ? "bg-primario" : "bg-oscuro"}`}
      >
        <Image src={icono} alt="" width={18} height={18} />
      </span>
      <div>
        <p className="font-semibold">{titulo}</p>
        <p className={azul ? "text-sobre-oscuro-suave" : "text-texto-suave"}>{children}</p>
      </div>
    </div>
  );
}
