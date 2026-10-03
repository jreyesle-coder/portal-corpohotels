/**
 * Ruta del panel del CMS: no es la predeterminada de Payload (/admin) (A2 5.02.a). Para cambiarla,
 * modificar este valor y renombrar la carpeta src/app/(payload)/gestion.
 */
export const RUTA_PANEL = "/gestion";

/** Solo se vuelve a rutas internas del panel, nunca a direcciones externas (redirección abierta). */
export function destinoSeguro(destino: string | null | undefined): string {
  if (!destino || !destino.startsWith(`${RUTA_PANEL}`) || destino.startsWith("//") || destino.includes("\\")) {
    return RUTA_PANEL;
  }
  return destino;
}
