"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { IconoAccesibilidad, IconoCerrar } from "./iconos";
import { useCerrarFuera } from "./use-cerrar-fuera";

/**
 * Herramienta de tamaño de texto y contraste (A2 7.01.u–v). El texto se amplía hasta el 200 %
 * escalando la raíz del documento. La preferencia se recuerda en el navegador; el script
 * `scriptPreferencias` la aplica antes del primer pintado para evitar parpadeos.
 */
const NIVELES = [100, 112.5, 125, 150, 200];
const CLAVE_TEXTO = "portal.texto";
const CLAVE_CONTRASTE = "portal.contraste";
const EVENTO = "portal:preferencias";

export const scriptPreferencias = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${CLAVE_TEXTO}"),c=localStorage.getItem("${CLAVE_CONTRASTE}");if(t&&t!=="0")d.dataset.texto=t;if(c==="alto")d.dataset.contraste="alto"}catch(e){}})();`;

type Preferencias = { nivel: number; contraste: boolean };

function leer(): string {
  const d = document.documentElement.dataset;
  return `${d.texto ?? "0"}|${d.contraste === "alto" ? "1" : "0"}`;
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

function guardar({ nivel, contraste }: Preferencias) {
  const raiz = document.documentElement;
  if (nivel === 0) delete raiz.dataset.texto;
  else raiz.dataset.texto = String(nivel);
  if (contraste) raiz.dataset.contraste = "alto";
  else delete raiz.dataset.contraste;
  try {
    localStorage.setItem(CLAVE_TEXTO, String(nivel));
    localStorage.setItem(CLAVE_CONTRASTE, contraste ? "alto" : "normal");
  } catch {
    // Sin almacenamiento (modo privado): la preferencia dura hasta recargar.
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Reaplica lo guardado si React volvió a dibujar <html> y borró los atributos del script inicial. */
function reaplicarGuardado() {
  try {
    const nivel = Number(localStorage.getItem(CLAVE_TEXTO) ?? 0);
    const contraste = localStorage.getItem(CLAVE_CONTRASTE) === "alto";
    const d = document.documentElement.dataset;
    if (String(nivel || "") !== (d.texto ?? "") || contraste !== (d.contraste === "alto")) {
      guardar({ nivel: NIVELES[nivel] ? nivel : 0, contraste });
    }
  } catch {
    // Sin almacenamiento disponible.
  }
}

export function HerramientaAccesibilidad() {
  useEffect(reaplicarGuardado, []);
  const instantanea = useSyncExternalStore(suscribir, leer, () => "0|0");
  const [nivelTexto, contrasteTexto] = instantanea.split("|");
  const nivel = Number(nivelTexto);
  const contraste = contrasteTexto === "1";

  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idPanel = useId();
  const cerrar = useCallback(() => setAbierto(false), []);
  useCerrarFuera(abierto, contenedor, cerrar, boton);

  const claseBoton =
    "min-h-11 cursor-pointer rounded-md border border-primario px-3 font-semibold text-primario hover:bg-primario-claro disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div ref={contenedor} className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      <div
        id={idPanel}
        hidden={!abierto}
        role="group"
        aria-label="Herramientas de accesibilidad"
        className="max-h-[calc(100dvh-6rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-borde bg-fondo p-4 text-texto shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Accesibilidad</h2>
          <button
            type="button"
            onClick={() => {
              cerrar();
              boton.current?.focus();
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-primario-claro"
          >
            <IconoCerrar width={18} height={18} />
            <span className="sr-only">Cerrar herramientas de accesibilidad</span>
          </button>
        </div>

        <p className="mb-2 text-sm" aria-live="polite">
          Tamaño del texto: <strong>{NIVELES[nivel]} %</strong>
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={claseBoton}
            disabled={nivel === 0}
            onClick={() => guardar({ nivel: nivel - 1, contraste })}
          >
            A−<span className="sr-only"> Reducir el texto</span>
          </button>
          <button
            type="button"
            className={claseBoton}
            disabled={nivel === NIVELES.length - 1}
            onClick={() => guardar({ nivel: nivel + 1, contraste })}
          >
            A+<span className="sr-only"> Aumentar el texto</span>
          </button>
          <button
            type="button"
            className={`${claseBoton} flex-1 text-sm`}
            disabled={nivel === 0}
            onClick={() => guardar({ nivel: 0, contraste })}
          >
            Restablecer
          </button>
        </div>

        <button
          type="button"
          aria-pressed={contraste}
          onClick={() => guardar({ nivel, contraste: !contraste })}
          className={`${claseBoton} w-full ${contraste ? "bg-primario text-sobre-primario hover:bg-primario" : ""}`}
        >
          Alto contraste: {contraste ? "activado" : "desactivado"}
        </button>
      </div>

      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((v) => !v)}
        className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-primario text-sobre-primario shadow-lg ring-2 ring-fondo"
      >
        <IconoAccesibilidad width={26} height={26} />
        <span className="sr-only">Herramientas de accesibilidad: tamaño del texto y contraste</span>
      </button>
    </div>
  );
}
