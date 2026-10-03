import * as oidc from "openid-client";
import type { Config } from "@/config";
import { ROLES, type Rol } from "@/cms/acceso";

/**
 * Cliente OpenID Connect contra Entra ID (local: simulador de Entra en Docker).
 * Flujo de código de autorización con PKCE, state y nonce; el token de identidad se valida
 * (firma, emisor, audiencia, vigencia) antes de leer sus reclamos.
 */
let configuracion: Promise<oidc.Configuration> | undefined;

export function clienteOidc(c: Config): Promise<oidc.Configuration> {
  configuracion ??= oidc
    .discovery(
      new URL(c.OIDC_ISSUER),
      c.OIDC_CLIENT_ID,
      c.OIDC_CLIENT_SECRET,
      undefined,
      // Solo el simulador local usa http; Entra ID siempre es https.
      c.OIDC_ISSUER.startsWith("http://") ? { execute: [oidc.allowInsecureRequests] } : undefined,
    )
    .catch((error) => {
      configuracion = undefined;
      throw error;
    });
  return configuracion;
}

export const urlRetorno = (c: Config) => new URL("/auth/entra/retorno", c.SITE_URL).toString();

/** Parámetros extra para exigir MFA mediante un contexto de autenticación de acceso condicional. */
export function parametrosMfa(c: Config): Record<string, string> {
  if (!c.OIDC_VERIFICACION_MFA.startsWith("acrs:")) return {};
  const contexto = c.OIDC_VERIFICACION_MFA.slice(5);
  return { claims: JSON.stringify({ id_token: { acrs: { essential: true, value: contexto } } }) };
}

export type Reclamos = Record<string, unknown>;

/** ¿El token prueba un segundo factor? (A2 5.05.o, A8 3.01.3) */
export function tieneMfa(c: Config, reclamos: Reclamos): boolean {
  const lista = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : []);
  if (c.OIDC_VERIFICACION_MFA === "amr") return lista(reclamos.amr).includes("mfa");
  return lista(reclamos.acrs).includes(c.OIDC_VERIFICACION_MFA.slice(5));
}

/** Roles de aplicación de Entra (Editor, Publicador, OAI, Administrador, Auditor) → roles del CMS. */
export function rolesDe(reclamos: Reclamos): Rol[] {
  const valores = Array.isArray(reclamos.roles) ? reclamos.roles.map((r) => String(r).toLowerCase()) : [];
  return ROLES.filter((r) => valores.includes(r));
}

export function identidadDe(reclamos: Reclamos) {
  const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const oid = texto(reclamos.oid) ?? texto(reclamos.sub);
  const email = (texto(reclamos.email) ?? texto(reclamos.preferred_username) ?? texto(reclamos.upn))?.toLowerCase();
  const nombre = texto(reclamos.name) ?? email;
  return { oid, email, nombre };
}
