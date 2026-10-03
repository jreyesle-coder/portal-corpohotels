"use client";

import { type RefObject, useEffect } from "react";

/** Cierra un desplegable con Escape o al hacer clic fuera; Escape devuelve el foco al disparador. */
export function useCerrarFuera(
  abierto: boolean,
  contenedor: RefObject<HTMLElement | null>,
  cerrar: () => void,
  disparador?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) cerrar();
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cerrar();
        disparador?.current?.focus();
      }
    };
    document.addEventListener("pointerdown", alPulsar);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsar);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, contenedor, cerrar, disparador]);
}
