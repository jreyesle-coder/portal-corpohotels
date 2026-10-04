import { NextResponse, type NextRequest } from "next/server";
import pg from "pg";
import { RUTAS_TRANSPARENCIA } from "./contenido/transparencia";
import { buscarRedireccion, RUTAS_ANTERIORES } from "./migracion/redireccion";

/**
 * Antes de que la solicitud llegue al portal:
 *
 * 1. Separación entre el portal público y el panel del CMS (A2 4.01.g). En la app pública
 *    (PANEL_HABILITADO=0) no existen el panel, el inicio de sesión ni la API de escritura: solo se
 *    sirven los archivos de imágenes y documentos. El panel corre como app aparte, sin acceso público.
 *
 * 2. Direcciones del portal anterior (Joomla): responden 301 a su equivalente según la tabla de
 *    redirecciones que genera la migración (S5); si no tienen equivalente, 404.
 *
 * 3. Contenido inexistente (noticias, servicios, páginas de «Sobre nosotros» y secciones de
 *    transparencia): si el slug no está
 *    publicado, se reescribe a una ruta inexistente para que responda el 404 institucional
 *    renderizado en el servidor (A2 2.01.b.xii). En Next 16, notFound() dentro de una página
 *    responde 404 pero el HTML lo dibuja el navegador; la documentación recomienda esta verificación.
 */
const ARCHIVOS_PUBLICOS = /^\/api\/(medios|documentos)\/file\//;
const CONTENIDO = /^\/(noticias|servicios|sobre-nosotros)\/([^/]+)(\/solicitud)?\/?$/;
const CONSULTAS: Record<string, string> = {
  noticias: `SELECT 1 FROM noticias WHERE slug = $1 AND _status = 'published' LIMIT 1`,
  // En producción (EXIGIR_FICHA_A5_COMPLETA=1) solo existen los servicios con la ficha A5 completa.
  servicios: `SELECT 1 FROM servicios WHERE slug = $1 AND _status = 'published'
    AND (ficha_completa OR $2 = '0') LIMIT 1`,
  "servicios/solicitud": `SELECT 1 FROM servicios WHERE slug = $1 AND _status = 'published'
    AND acceso_solicitud_en_linea AND (ficha_completa OR $2 = '0') LIMIT 1`,
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
    const consulta = CONSULTAS[seccion];
    const parametros = consulta.includes("$2") ? [slug, process.env.EXIGIR_FICHA_A5_COMPLETA === "1" ? "1" : "0"] : [slug];
    const r = await pool().query(consulta, parametros);
    const resultado = (r.rowCount ?? 0) > 0;
    if (cache.size > 2000) cache.clear();
    cache.set(clave, { existe: resultado, vence: Date.now() + VIGENCIA_MS });
    return resultado;
  } catch {
    // Si la base de datos no responde, decide la propia página.
    return true;
  }
}

const cacheRedirecciones = new Map<string, { destino: string | null; vence: number }>();

async function redireccion(rutaConConsulta: string): Promise<string | null> {
  const guardado = cacheRedirecciones.get(rutaConConsulta);
  if (guardado && guardado.vence > Date.now()) return guardado.destino;
  try {
    const destino = await buscarRedireccion(pool(), rutaConConsulta);
    if (cacheRedirecciones.size > 5000) cacheRedirecciones.clear();
    cacheRedirecciones.set(rutaConConsulta, { destino, vence: Date.now() + VIGENCIA_MS });
    return destino;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (RUTAS_ANTERIORES.test(pathname)) {
    const destino = await redireccion(pathname + search);
    if (destino) return NextResponse.redirect(new URL(destino, request.url), 301);
    return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
  }

  if (pathname.startsWith("/gestion") || pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    if (process.env.PANEL_HABILITADO !== "0") return NextResponse.next();
    const esArchivo = request.method === "GET" && ARCHIVOS_PUBLICOS.test(pathname);
    if (esArchivo || pathname === "/api/salud") return NextResponse.next();
    return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
  }

  // Las secciones de transparencia son fijas por norma: se validan sin consultar la base de datos.
  if (pathname.startsWith("/transparencia/") && !RUTAS_TRANSPARENCIA.has(pathname.replace(/\/$/, ""))) {
    return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
  }

  const coincidencia = CONTENIDO.exec(pathname);
  if (coincidencia && !PAGINAS_FIJAS.has(pathname.replace(/\/$/, ""))) {
    const [, base, slug, solicitud] = coincidencia;
    const seccion = solicitud ? (base === "servicios" ? "servicios/solicitud" : "") : base;
    const valido = /^[a-z0-9-]{1,120}$/.test(slug);
    if (!valido || !CONSULTAS[seccion] || !(await existe(seccion, slug))) {
      return NextResponse.rewrite(new URL(NO_EXISTE, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/gestion/:path*",
    "/auth/:path*",
    "/api/:path*",
    "/noticias/:slug",
    "/servicios/:slug",
    "/servicios/:slug/solicitud",
    "/sobre-nosotros/:slug",
    "/transparencia/:path+",
    // Portal anterior (Joomla).
    "/index.php",
    "/index.php/:path*",
    "/images/:path*",
    "/media/k2/:path*",
    "/component/:path*",
  ],
};
