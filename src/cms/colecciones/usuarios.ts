import type {
  AuthStrategy,
  CollectionAfterChangeHook,
  CollectionAfterLogoutHook,
  CollectionConfig,
  FieldAccess,
} from "payload";
import { COOKIE_SESION, tokenDeSesion, verificarSesion } from "@/auth/sesion";
import { obtenerConfigCms } from "@/config";
import { campoCon, con, ETIQUETAS_ROL, nadie, ROLES, tieneRol } from "../acceso";
import { ipDe, registrarEvento } from "../bitacora";

/**
 * Estrategia de autenticación del CMS: solo sesiones abiertas con Entra ID (A2 5.05.o).
 * No existe usuario ni contraseña local (disableLocalStrategy).
 */
const sinEditar: FieldAccess = () => false;

const estrategiaEntra: AuthStrategy = {
  name: "entra-id",
  authenticate: async ({ payload, headers }) => {
    const token = tokenDeSesion(headers, payload.config.csrf);
    if (!token) return { user: null };
    const sesion = await verificarSesion(obtenerConfigCms().PAYLOAD_SECRET, token);
    if (!sesion) return { user: null };
    const usuario = await payload
      .findByID({ collection: "usuarios", id: sesion.usuarioId, depth: 0, overrideAccess: true, showHiddenFields: true })
      .catch(() => null);
    if (!usuario || usuario.activo === false || usuario.sesionId !== sesion.sid) return { user: null };
    // El identificador de sesión nunca sale del servidor (p. ej., en /api/usuarios/me).
    const publico: Partial<typeof usuario> = { ...usuario };
    delete publico.sesionId;
    return { user: { ...(publico as typeof usuario), collection: "usuarios", _strategy: "entra-id" } };
  },
};

const auditarPermisos: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== "update") return doc;
  const rolesAntes = [...(previousDoc?.roles ?? [])].sort().join(",");
  const rolesAhora = [...(doc.roles ?? [])].sort().join(",");
  if (rolesAntes !== rolesAhora || previousDoc?.activo !== doc.activo) {
    await registrarEvento(
      req.payload,
      {
        evento: "cambio_permisos",
        coleccion: "usuarios",
        documentoId: String(doc.id),
        titulo: doc.email,
        usuarioId: req.user ? String(req.user.id) : undefined,
        usuarioCorreo: (req.user as { email?: string } | null)?.email ?? "Entra ID",
        ip: ipDe(req.headers),
        detalle: {
          rolesAntes: previousDoc?.roles ?? [],
          rolesAhora: doc.roles ?? [],
          activoAntes: previousDoc?.activo,
          activoAhora: doc.activo,
        },
      },
      req,
    );
  }
  return doc;
};

const alCerrarSesion: CollectionAfterLogoutHook = async ({ req }) => {
  const u = req.user as { id: number | string; email?: string } | null;
  if (!u) return;
  await req.payload.update({
    collection: "usuarios",
    id: u.id,
    data: { sesionId: null },
    overrideAccess: true,
    context: { sinAuditoria: true },
    req,
  });
  await registrarEvento(
    req.payload,
    { evento: "cierre_sesion", usuarioId: String(u.id), usuarioCorreo: u.email, ip: ipDe(req.headers) },
    req,
  );
};

/**
 * Usuarios del CMS. Se crean y actualizan solos al iniciar sesión con Entra ID; los roles vienen
 * de los roles de aplicación asignados en Entra. El administrador solo puede desactivar o
 * reactivar una cuenta (procedimiento de traspaso, A2 5.05.o).
 */
export const Usuarios: CollectionConfig = {
  slug: "usuarios",
  labels: { singular: "Usuario", plural: "Usuarios" },
  auth: {
    disableLocalStrategy: true,
    strategies: [estrategiaEntra],
  },
  admin: {
    useAsTitle: "nombre",
    group: "Seguridad",
    defaultColumns: ["nombre", "email", "roles", "activo", "ultimoAcceso"],
    description: "Las cuentas y los roles se administran en Entra ID. Aquí solo se activa o desactiva el acceso.",
  },
  access: {
    read: ({ req }) =>
      tieneRol(req.user, "administrador", "auditor") || (req.user ? { id: { equals: req.user.id } } : false),
    create: nadie,
    update: con("administrador"),
    delete: nadie,
    admin: ({ req }) => tieneRol(req.user, ...ROLES),
  },
  hooks: {
    afterChange: [
      (args) => (args.context?.sinAuditoria ? args.doc : auditarPermisos(args)),
    ],
    afterLogout: [alCerrarSesion],
  },
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true, access: { update: sinEditar } },
    {
      name: "email",
      label: "Correo",
      type: "email",
      required: true,
      unique: true,
      access: { update: sinEditar },
    },
    {
      name: "roles",
      label: "Roles",
      type: "select",
      hasMany: true,
      options: ROLES.map((value) => ({ value, label: ETIQUETAS_ROL[value] })),
      access: { update: sinEditar },
      admin: { description: "Asignados en Entra ID (roles de aplicación)." },
    },
    {
      name: "activo",
      label: "Acceso activo",
      type: "checkbox",
      defaultValue: true,
      access: { update: campoCon("administrador") },
    },
    {
      name: "entraOid",
      label: "Identificador en Entra ID",
      type: "text",
      unique: true,
      index: true,
      access: { update: sinEditar },
      admin: { readOnly: true },
    },
    {
      name: "ultimoAcceso",
      label: "Último acceso",
      type: "date",
      access: { update: sinEditar },
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "sesionId",
      type: "text",
      hidden: true,
      access: { read: sinEditar, update: sinEditar },
    },
  ],
};

export { COOKIE_SESION };
