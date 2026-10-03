import * as oidc from "openid-client";
import { NextResponse, type NextRequest } from "next/server";
import { clienteOidc, parametrosMfa, urlRetorno } from "@/auth/entra";
import { cifrarFlujo, COOKIE_FLUJO, opcionesCookie } from "@/auth/sesion";
import { destinoSeguro } from "@/cms/rutas";
import { obtenerConfig } from "@/config";

export const dynamic = "force-dynamic";

/** Inicia sesión en el CMS: redirige a Entra ID con PKCE, state y nonce. */
export async function GET(request: NextRequest) {
  const c = obtenerConfig();
  const cliente = await clienteOidc(c);
  const verificador = oidc.randomPKCECodeVerifier();
  const estado = {
    state: oidc.randomState(),
    nonce: oidc.randomNonce(),
    verificador,
    destino: destinoSeguro(request.nextUrl.searchParams.get("destino")),
  };
  const url = oidc.buildAuthorizationUrl(cliente, {
    redirect_uri: urlRetorno(c),
    scope: "openid profile email",
    response_type: "code",
    code_challenge: await oidc.calculatePKCECodeChallenge(verificador),
    code_challenge_method: "S256",
    state: estado.state,
    nonce: estado.nonce,
    ...parametrosMfa(c),
  });
  const respuesta = NextResponse.redirect(url);
  respuesta.cookies.set(
    COOKIE_FLUJO,
    await cifrarFlujo(c.PAYLOAD_SECRET, estado),
    opcionesCookie(c.SITE_URL.startsWith("https://"), 600),
  );
  return respuesta;
}
