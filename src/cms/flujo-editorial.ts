import { APIError, type CollectionBeforeChangeHook } from "payload";
import { PUEDEN_PUBLICAR, tieneRol } from "./acceso";

/**
 * Separación de funciones (A8 3.01.5): el editor redacta y guarda borradores; solo el publicador
 * (o el administrador) publica. Un editor tampoco puede alterar directamente lo ya publicado: sus
 * cambios quedan como borrador hasta que un publicador los apruebe.
 */
export const controlPublicacion: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  if (!req.user || tieneRol(req.user, ...PUEDEN_PUBLICAR)) return data;
  const publicaAhora = data._status === "published";
  const tocaPublicado = operation === "update" && originalDoc?._status === "published" && data._status !== "draft";
  if (publicaAhora || tocaPublicado) {
    throw new APIError(
      "Su rol no puede publicar. Guarde el cambio como borrador y márquelo como listo para revisión.",
      403,
      undefined,
      true,
    );
  }
  return data;
};
