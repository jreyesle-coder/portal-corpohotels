import { NextResponse, type NextRequest } from "next/server";

/**
 * Separación entre el portal público y el panel del CMS (A2 4.01.g, arquitectura del documento).
 * En la app pública (PANEL_HABILITADO=0) no existen el panel, el inicio de sesión ni la API de
 * escritura: solo se sirven los archivos de imágenes y documentos. El panel corre como app aparte,
 * sin acceso público, con PANEL_HABILITADO=1.
 */
const ARCHIVOS_PUBLICOS = /^\/api\/(medios|documentos)\/file\//;

export function proxy(request: NextRequest) {
  if (process.env.PANEL_HABILITADO !== "0") return NextResponse.next();
  const { pathname } = request.nextUrl;
  const esArchivo = request.method === "GET" && ARCHIVOS_PUBLICOS.test(pathname);
  if (esArchivo || pathname === "/api/salud") return NextResponse.next();
  return NextResponse.rewrite(new URL("/_no-disponible", request.url));
}

export const config = {
  matcher: ["/gestion/:path*", "/auth/:path*", "/api/:path*"],
};
