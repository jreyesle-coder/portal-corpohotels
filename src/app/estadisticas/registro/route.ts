import type { NextRequest } from "next/server";
import { obtenerConfig } from "@/config";

export const dynamic = "force-dynamic";

/**
 * Reenvía a Matomo los registros de visitas del navegador (A2 5.04.3). Solo pasan los parámetros
 * del rastreador, con la IP y el navegador del visitante (Matomo los anonimiza y no usa cookies).
 * El sitio es siempre el configurado: nadie puede registrar visitas de otro sitio por esta vía.
 */
async function reenviar(request: NextRequest) {
  const { MATOMO_URL, MATOMO_SITE_ID } = obtenerConfig();
  if (!MATOMO_URL || !MATOMO_SITE_ID) return new Response(null, { status: 204 });
  const parametros = new URLSearchParams(request.nextUrl.search);
  if (request.method === "POST") {
    const cuerpo = await request.text();
    if (cuerpo.length > 8192) return new Response(null, { status: 413 });
    for (const [k, v] of new URLSearchParams(cuerpo)) parametros.set(k, v);
  }
  parametros.set("idsite", String(MATOMO_SITE_ID));
  parametros.set("rec", "1");
  // Nunca se reenvían credenciales ni la IP que el visitante declare por parámetro.
  for (const prohibido of ["token_auth", "cip", "cdt", "country", "region", "city", "lat", "long"]) parametros.delete(prohibido);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  try {
    const r = await fetch(`${MATOMO_URL.replace(/\/$/, "")}/matomo.php?${parametros}`, {
      headers: {
        "User-Agent": request.headers.get("user-agent") ?? "",
        "Accept-Language": request.headers.get("accept-language") ?? "",
        ...(ip ? { "X-Forwarded-For": ip } : {}),
      },
      cache: "no-store",
    });
    await r.body?.cancel();
  } catch {
    // Las estadísticas nunca deben afectar la navegación.
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export const GET = reenviar;
export const POST = reenviar;
