import { revisarConfig } from "@/config";

export const dynamic = "force-dynamic";

/**
 * Sonda de salud para Docker y App Service (Health check).
 * No expone valores ni nombres de variables al exterior (A2 5.05.j); el detalle
 * queda en el log del servidor.
 */
export function GET() {
  const faltantes = revisarConfig();
  if (faltantes.length > 0) {
    console.error(`[salud] configuración incompleta: ${faltantes.join(", ")}`);
    return Response.json({ estado: "degradado" }, { status: 503 });
  }
  return Response.json({ estado: "ok" });
}
