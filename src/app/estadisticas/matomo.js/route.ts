import { obtenerConfig } from "@/config";

export const dynamic = "force-dynamic";

/** Script de Matomo servido desde el propio portal: el navegador no contacta a terceros (A2 5.04.3). */
export async function GET() {
  const { MATOMO_URL } = obtenerConfig();
  if (!MATOMO_URL) return new Response("", { status: 404 });
  try {
    const r = await fetch(`${MATOMO_URL.replace(/\/$/, "")}/matomo.js`, { next: { revalidate: 86400 } });
    if (!r.ok) return new Response("", { status: 502 });
    return new Response(await r.text(), {
      headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response("", { status: 502 });
  }
}
