import { createHash, randomBytes } from "node:crypto";
import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT } from "jose";

/**
 * Sesión del CMS tras autenticarse en Entra ID.
 * - Cookie `cph-token` (la misma que Payload expira al cerrar sesión), HttpOnly, SameSite=Lax y
 *   Secure en HTTPS. Contiene un JWT firmado con el id del usuario y un identificador de sesión
 *   que también se guarda en el usuario: cerrar sesión o desactivar al usuario la invalida.
 * - Cookie `cph-oidc`: estado temporal del flujo OIDC (state, nonce, PKCE), cifrada y de 10 min.
 */
export const COOKIE_SESION = "cph-token";
export const COOKIE_FLUJO = "cph-oidc";
export const DURACION_SESION_S = 8 * 60 * 60;
const DURACION_FLUJO_S = 10 * 60;

const clave = (secreto: string, uso: string) => createHash("sha256").update(`${uso}:${secreto}`).digest();

export const nuevoIdSesion = () => randomBytes(24).toString("base64url");

export async function firmarSesion(secreto: string, usuarioId: string, sid: string) {
  return new SignJWT({ sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuarioId)
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SESION_S}s`)
    .setAudience("cms-corphotels")
    .sign(clave(secreto, "sesion"));
}

export async function verificarSesion(secreto: string, token: string) {
  try {
    const { payload } = await jwtVerify(token, clave(secreto, "sesion"), {
      algorithms: ["HS256"],
      audience: "cms-corphotels",
    });
    if (!payload.sub || typeof payload.sid !== "string") return null;
    return { usuarioId: payload.sub, sid: payload.sid };
  } catch {
    return null;
  }
}

export type EstadoFlujo = { state: string; nonce: string; verificador: string; destino: string };

export async function cifrarFlujo(secreto: string, estado: EstadoFlujo) {
  return new EncryptJWT(estado)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_FLUJO_S}s`)
    .encrypt(clave(secreto, "flujo-oidc"));
}

export async function descifrarFlujo(secreto: string, token: string): Promise<EstadoFlujo | null> {
  try {
    const { payload } = await jwtDecrypt(token, clave(secreto, "flujo-oidc"));
    return payload as unknown as EstadoFlujo;
  } catch {
    return null;
  }
}

export function opcionesCookie(seguro: boolean, maxAge: number) {
  return { httpOnly: true, secure: seguro, sameSite: "lax" as const, path: "/", maxAge };
}

export function leerCookie(headers: Headers, nombre: string): string | undefined {
  const cabecera = headers.get("cookie");
  if (!cabecera) return undefined;
  for (const parte of cabecera.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/**
 * Lee la cookie de sesión con la misma regla anti-CSRF de Payload (A2 5.05.d.ii): si la petición
 * trae Origin, debe ser el del sitio; si no lo trae, el navegador debe declararla del mismo sitio
 * (Sec-Fetch-Site). Una página ajena nunca puede usar la sesión del personal.
 */
export function tokenDeSesion(headers: Headers, origenesPermitidos: string[]): string | undefined {
  const token = leerCookie(headers, COOKIE_SESION);
  if (!token) return undefined;
  const origen = headers.get("origin");
  if (origen) return origenesPermitidos.includes(origen) ? token : undefined;
  const sitio = headers.get("sec-fetch-site");
  return sitio === "same-origin" || sitio === "same-site" || sitio === "none" ? token : undefined;
}
