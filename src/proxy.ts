import { NextResponse, type NextRequest } from "next/server";
import pg from "pg";
import { RUTAS_TRANSPARENCIA } from "./contenido/transparencia";
import { buscarRedireccion, RUTAS_ANTERIORES } from "./migracion/redireccion";
import { nonceNuevo, POLITICA_PANEL, politicaContenido } from "./seguridad/cabeceras";

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
 * 3. Cabeceras de seguridad de cada página: CSP con nonce (A8 3.03) y dirección canónica (A2 6.01).
 *
 * 4. Contenido inexistente (noticias, servicios, páginas de «Sobre nosotros» y secciones de
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
    return pagina(request, NO_EXISTE);
  }

  if (pathname.startsWith("/gestion") || pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    if (process.env.PANEL_HABILITADO !== "0") {
      const r = NextResponse.next();
      if (pathname.startsWith("/gestion")) r.headers.set("Content-Security-Policy", politicaPanel());
      return r;
    }
    const esArchivo = request.method === "GET" && ARCHIVOS_PUBLICOS.test(pathname);
    if (esArchivo || pathname === "/api/salud") return NextResponse.next();
    return pagina(request, NO_EXISTE);
  }

  // Las secciones de transparencia son fijas por norma: se validan sin consultar la base de datos.
  if (pathname.startsWith("/transparencia/") && !RUTAS_TRANSPARENCIA.has(pathname.replace(/\/$/, ""))) {
    return pagina(request, NO_EXISTE);
  }

  const coincidencia = CONTENIDO.exec(pathname);
  if (coincidencia && !PAGINAS_FIJAS.has(pathname.replace(/\/$/, ""))) {
    const [, base, slug, solicitud] = coincidencia;
    const seccion = solicitud ? (base === "servicios" ? "servicios/solicitud" : "") : base;
    const valido = /^[a-z0-9-]{1,120}$/.test(slug);
    if (!valido || !CONSULTAS[seccion] || !(await existe(seccion, slug))) {
      return pagina(request, NO_EXISTE);
    }
  }
  return pagina(request);
}

const desarrollo = process.env.NODE_ENV === "development";
const politicaPanel = () => (desarrollo ? POLITICA_PANEL.replace("'unsafe-inline'", "'unsafe-inline' 'unsafe-eval'") : POLITICA_PANEL);

/**
 * Respuesta de una página del portal: CSP con nonce propio (A8 3.03) y dirección canónica (A2
 * 6.01.g.iii). Con `reescribir`, la página es el 404 institucional.
 */
function pagina(request: NextRequest, reescribir?: string) {
  const nonce = nonceNuevo();
  const csp = politicaContenido(nonce, { desarrollo, https: (process.env.SITE_URL ?? "").startsWith("https://") });
  const cabeceras = new Headers(request.headers);
  cabeceras.set("x-nonce", nonce);
  cabeceras.set("Content-Security-Policy", csp);
  // Dirección canónica: la ruta sin parámetros, salvo los que cambian el contenido (página de un
  // listado, año de transparencia). El layout la publica en <link rel=canonical>.
  const canonica = new URLSearchParams();
  for (const p of ["pagina", "anio"]) {
    const v = request.nextUrl.searchParams.get(p);
    if (v && /^\d{1,4}$/.test(v)) canonica.set(p, v);
  }
  cabeceras.set("x-ruta-canonica", request.nextUrl.pathname.replace(/(.)\/$/, "$1") + (canonica.size ? `?${canonica}` : ""));
  const respuesta = reescribir
    ? NextResponse.rewrite(new URL(reescribir, request.url), { request: { headers: cabeceras } })
    : NextResponse.next({ request: { headers: cabeceras } });
  respuesta.headers.set("Content-Security-Policy", csp);
  return respuesta;
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
    // Todas las páginas del portal, para la dirección canónica.
    "/((?!_next/|api/|gestion|auth/|brand/|iconos/|favicon|manifest|robots.txt|sitemap.xml|exportar-pdf|estadisticas/).*)",
  ],
};
