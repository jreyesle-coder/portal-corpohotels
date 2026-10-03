import { NextResponse, type NextRequest } from "next/server";
import pg from "pg";

/**
 * Antes de que la solicitud llegue al portal:
 *
 * 1. Separación entre el portal público y el panel del CMS (A2 4.01.g). En la app pública
 *    (PANEL_HABILITADO=0) no existen el panel, el inicio de sesión ni la API de escritura: solo se
 *    sirven los archivos de imágenes y documentos. El panel corre como app aparte, sin acceso público.
 *
 * 2. Contenido inexistente (noticias, servicios y páginas de «Sobre nosotros»): si el slug no está
 *    publicado, se reescribe a una ruta inexistente para que responda el 404 institucional
 *    renderizado en el servidor (A2 2.01.b.xii). En Next 16, notFound() dentro de una página
 *    responde 404 pero el HTML lo dibuja el navegador; la documentación recomienda esta verificación.
 */
const ARCHIVOS_PUBLICOS = /^\/api\/(medios|documentos)\/file\//;
const CONTENIDO = /^\/(noticias|servicios|sobre-nosotros)\/([^/]+)\/?$/;
const CONSULTAS: Record<string, string> = {
  noticias: `SELECT 1 FROM noticias WHERE slug = $1 AND _status = 'published' LIMIT 1`,
  servicios: `SELECT 1 FROM servicios WHERE slug = $1 AND _status = 'published' LIMIT 1`,
  // Solo las páginas cuya sección superior es «Sobre nosotros».
  "sobre-nosotros": `SELECT 1 FROM paginas p JOIN paginas s ON s.id = p.padre_id
    WHERE p.slug = $1 AND p._status = 'published' AND s.slug = 'sobre-nosotros' LIMIT 1`,
};
const PAGINAS_FIJAS = new Set(["/sobre-nosotros/marco-legal"]);
const NO_EXISTE = "/_no-existe";

declare global {
  var poolProxy: pg.Pool | undefined;
}
const pool = () => (globalThis.poolProxy ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 }));

// Caché breve para no consultar la base de datos en cada visita.
const cache = new Map<string, { existe: boolean; vence: number }>();
const VIGENCIA_MS = 30_000;

async function existe(seccion: string, slug: string): Promise<boolean> {
  const clave = `${seccion}:${slug}`;
  const guardado = cache.get(clave);
  if (guardado && guardado.vence > Date.now()) return guardado.existe;
  try {
    const r = await pool().query(CONSULTAS[seccion], [slug]);
    const resultado = (r.rowCount ?? 0) > 0;
    if (cache.size > 2000) cache.clear();
    cache.set(clave, { existe: resultado, vence: Date.now() + VIGENCIA_MS });
    return resultado;
  } catch {
    // Si la base de datos no responde, decide la propia página.
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/gestion") || pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    if (process.env.PANEL_HABILITADO !== "0") return NextResponse.next();
    const esArchivo = request.method === "GET" && ARCHIVOS_PUBLICOS.test(pathname);
    if (esArchivo || pathname === "/api/salud") return NextResponse.next();
    return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
  }

  const coincidencia = CONTENIDO.exec(pathname);
  if (coincidencia && !PAGINAS_FIJAS.has(pathname.replace(/\/$/, ""))) {
    const [, seccion, slug] = coincidencia;
    const valido = /^[a-z0-9-]{1,120}$/.test(slug);
    if (!valido || !(await existe(seccion, slug))) {
      return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/gestion/:path*", "/auth/:path*", "/api/:path*", "/noticias/:slug", "/servicios/:slug", "/sobre-nosotros/:slug"],
};
