import type { Access, FieldAccess, PayloadRequest, Where } from "payload";

/**
 * Roles del CMS con mínimo privilegio y separación de funciones (A8 3.01.5).
 * Se asignan en Entra ID como roles de aplicación; el CMS solo los refleja.
 *
 * | Rol           | Puede                                                                 |
 * | ------------- | --------------------------------------------------------------------- |
 * | editor        | Crear y editar borradores de contenido institucional; no publica      |
 * | publicador    | Todo lo del editor, más publicar, despublicar y eliminar              |
 * | oai           | Gestionar documentos de transparencia (Oficina de Acceso a la Información) |
 * | administrador | Menús, usuarios (activar o desactivar) y toda la configuración        |
 * | auditor       | Solo lectura de todo, incluida la bitácora                            |
 */
export const ROLES = ["editor", "publicador", "oai", "administrador", "auditor"] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETAS_ROL: Record<Rol, string> = {
  editor: "Editor",
  publicador: "Publicador",
  oai: "OAI",
  administrador: "Administrador",
  auditor: "Auditor",
};

type UsuarioCms = { collection?: string; roles?: Rol[] | null; activo?: boolean | null };

export function tieneRol(usuario: unknown, ...roles: Rol[]): boolean {
  const u = usuario as UsuarioCms | null | undefined;
  if (!u || u.collection !== "usuarios" || u.activo === false) return false;
  return roles.some((r) => u.roles?.includes(r));
}

export const con =
  (...roles: Rol[]): Access =>
  ({ req }) =>
    tieneRol(req.user, ...roles);

export const campoCon =
  (...roles: Rol[]): FieldAccess =>
  ({ req }) =>
    tieneRol(req.user, ...roles);

export const nadie: Access = () => false;
export const todos: Access = () => true;

/** Personal del CMS: cualquier rol activo. */
export const personal: Access = ({ req }) => tieneRol(req.user, ...ROLES);

/** Contenido con borradores: el público solo lee lo publicado; el personal lee todo. */
export const leerPublicado: Access = ({ req }) => {
  if (tieneRol(req.user, ...ROLES)) return true;
  return { _status: { equals: "published" } } satisfies Where;
};

export const PUEDEN_PUBLICAR: Rol[] = ["publicador", "administrador"];
export const PUEDEN_EDITAR: Rol[] = ["editor", "publicador", "administrador"];

export function usuarioDe(req: PayloadRequest) {
  return req.user as (UsuarioCms & { id: number | string; email?: string; nombre?: string }) | null;
}
