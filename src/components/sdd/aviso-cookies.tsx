"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

/**
 * Aviso de cookies no modal (Ley 172-13, A2 4.02.g y 7.01.w): no bloquea la página ni roba el foco.
 * El portal solo usa almacenamiento técnico (preferencias de accesibilidad) y, si la persona lo
 * acepta, la medición estadística de Matomo autohospedado sin terceros (S6).
 */
export const CLAVE_CONSENTIMIENTO = "portal.estadisticas";
const EVENTO = "portal:consentimiento";

function leer(): string {
  try {
    return localStorage.getItem(CLAVE_CONSENTIMIENTO) ?? "pendiente";
  } catch {
    return "pendiente";
  }
}

function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}

function decidir(valor: "aceptadas" | "rechazadas") {
  try {
    localStorage.setItem(CLAVE_CONSENTIMIENTO, valor);
  } catch {
    // Sin almacenamiento: el aviso volverá a mostrarse en la próxima visita.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function AvisoCookies() {
  // En el servidor se asume decidido para no pintar el aviso antes de saber la preferencia.
  const estado = useSyncExternalStore(suscribir, leer, () => "decidido");
  if (estado !== "pendiente") return null;

  return (
    <section
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-primario bg-fondo text-texto shadow-[0_-4px_16px_rgb(0_0_0/0.12)] print:hidden"
      data-aviso-cookies
    >
      <div className="contenedor flex flex-col gap-3 py-4 pr-20 text-sm esc:flex-row esc:items-center esc:justify-between">
        <p className="max-w-3xl">
          Este portal usa almacenamiento técnico para recordar sus preferencias y, solo si usted lo acepta, estadísticas
          anónimas de visitas que no se comparten con terceros. Más información en la{" "}
          <Link href="/politica-de-privacidad" className="font-semibold text-primario underline underline-offset-2">
            Política de privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decidir("rechazadas")}
            className="min-h-11 cursor-pointer rounded-md border-2 border-primario px-4 font-semibold text-primario hover:bg-primario-claro"
          >
            Rechazar estadísticas
          </button>
          <button
            type="button"
            onClick={() => decidir("aceptadas")}
            className="min-h-11 cursor-pointer rounded-md bg-primario px-4 font-semibold text-sobre-primario hover:brightness-110"
          >
            Aceptar estadísticas
          </button>
        </div>
      </div>
    </section>
  );
}
