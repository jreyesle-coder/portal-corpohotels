import config from "@payload-config";
import * as oidc from "openid-client";
import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";
import { clienteOidc, identidadDe, rolesDe, tieneMfa, urlRetorno } from "@/auth/entra";
import {
  COOKIE_FLUJO,
  COOKIE_SESION,
  descifrarFlujo,
  DURACION_SESION_S,
  firmarSesion,
  nuevoIdSesion,
  opcionesCookie,
} from "@/auth/sesion";
import { ipDe, registrarEvento } from "@/cms/bitacora";
import { obtenerConfig } from "@/config";

export const dynamic = "force-dynamic";

type Motivo = "sin-mfa" | "sin-rol" | "inactivo" | "error";

/**
 * Retorno desde Entra ID. Valida el token, exige doble factor y al menos un rol del CMS, crea o
 * actualiza al usuario y abre la sesión. Todo intento queda en la bitácora.
 */
export async function GET(request: NextRequest) {
  const c = obtenerConfig();
  const payload = await getPayload({ config });
  const ip = ipDe(request.headers);
  const seguro = c.SITE_URL.startsWith("https://");

  const rechazar = async (motivo: Motivo, correo?: string, detalle?: Record<string, unknown>) => {
    await registrarEvento(payload, { evento: "inicio_sesion_rechazado", usuarioCorreo: correo, ip, detalle: { motivo, ...detalle } });
    const respuesta = NextResponse.redirect(new URL(`/acceso-denegado?motivo=${motivo}`, c.SITE_URL));
    respuesta.cookies.delete(COOKIE_FLUJO);
    return respuesta;
  };

  const flujo = await descifrarFlujo(c.PAYLOAD_SECRET, request.cookies.get(COOKIE_FLUJO)?.value ?? "");
  if (!flujo) return rechazar("error", undefined, { causa: "flujo vencido o ausente" });

  let reclamos: Record<string, unknown>;
  try {
    const cliente = await clienteOidc(c);
    // La URL actual se reconstruye con la dirección pública: detrás del WAF y Front Door el host
    // interno no coincide con el registrado en Entra ID.
    const actual = new URL(urlRetorno(c));
    actual.search = request.nextUrl.search;
    const tokens = await oidc.authorizationCodeGrant(cliente, actual, {
      pkceCodeVerifier: flujo.verificador,
      expectedState: flujo.state,
      expectedNonce: flujo.nonce,
      idTokenExpected: true,
    });
    reclamos = (tokens.claims() ?? {}) as Record<string, unknown>;
  } catch (error) {
    payload.logger.warn({ err: error }, "Fallo al validar el retorno de Entra ID");
    return rechazar("error", undefined, { causa: "validación OIDC" });
  }

  const { oid, email, nombre } = identidadDe(reclamos);
  if (!oid || !email) return rechazar("error", email, { causa: "token sin identificador o correo" });
  if (!tieneMfa(c, reclamos)) return rechazar("sin-mfa", email);
  const roles = rolesDe(reclamos);
  if (roles.length === 0) return rechazar("sin-rol", email);

  const existente = (
    await payload.find({
      collection: "usuarios",
      where: { or: [{ entraOid: { equals: oid } }, { email: { equals: email } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0];
  if (existente?.activo === false) return rechazar("inactivo", email);

  const sid = nuevoIdSesion();
  const datos = { nombre: nombre ?? email, email, entraOid: oid, roles, sesionId: sid, ultimoAcceso: new Date().toISOString() };
  const usuario = existente
    ? await payload.update({ collection: "usuarios", id: existente.id, data: datos, overrideAccess: true, depth: 0 })
    : await payload.create({ collection: "usuarios", data: { ...datos, activo: true }, overrideAccess: true, depth: 0 });

  await registrarEvento(payload, {
    evento: "inicio_sesion",
    usuarioId: String(usuario.id),
    usuarioCorreo: email,
    ip,
    detalle: { roles, nuevo: !existente },
  });

  const respuesta = NextResponse.redirect(new URL(flujo.destino, c.SITE_URL));
  respuesta.cookies.delete(COOKIE_FLUJO);
  respuesta.cookies.set(
    COOKIE_SESION,
    await firmarSesion(c.PAYLOAD_SECRET, String(usuario.id), sid),
    opcionesCookie(seguro, DURACION_SESION_S),
  );
  return respuesta;
}
