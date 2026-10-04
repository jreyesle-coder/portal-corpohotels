/** URL del portal anterior (Joomla), compartida por la migración (S5) y las redirecciones del proxy. */
export const HOST = "https://corphotels.gob.do";

/**
 * Forma única de una URL del portal anterior: ruta + consulta relevante, sin host ni fragmento.
 * Devuelve null si la URL es de otro dominio. Incluye www y http, que el portal actual también sirve.
 */
export function normalizarUrl(url: string): string | null {
  if (/[\u0000-\u001f\u007f]/.test(url)) return null;
  let u: URL;
  try {
    u = new URL(url.replace(/^\/\//, "https://"), HOST);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").replace(/:\d+$/, "");
  if (host !== "corphotels.gob.do") return null;
  // «/transparencia/../index.php» del menú de transparencia.
  let decodificada: string;
  try {
    decodificada = decodeURIComponent(u.pathname);
  } catch {
    // Codificación inválida (por ejemplo «%E0%A4%A»): no es una URL del portal anterior.
    return null;
  }
  let ruta = decodificada.replace(/\/transparencia\/\.\.\//, "/").replace(/\/{2,}/g, "/");
  if (ruta === "/index.php/") ruta = "/index.php";
  const consulta = [...u.searchParams.entries()]
    .filter(([k]) => !/^(utm_|fbclid|gclid|lang$|Itemid$)/.test(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return consulta ? `${ruta}?${consulta}` : ruta;
}
