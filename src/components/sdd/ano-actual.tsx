"use client";

import { useSyncExternalStore } from "react";

const ANO_COMPILACION = new Date().getFullYear();
const suscribir = () => () => {};

/** Año actual del aviso de derechos (A2 3.02.f); se corrige en el cliente si la página es estática. */
export function AnoActual() {
  const ano = useSyncExternalStore(
    suscribir,
    () => new Date().getFullYear(),
    () => ANO_COMPILACION,
  );
  return <>{ano}</>;
}
