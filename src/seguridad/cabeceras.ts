/**
 * Cabeceras de seguridad (A8 3.03, A2 5.05). La política de contenido (CSP) del portal público usa
 * un nonce por solicitud: solo se ejecutan los scripts del propio portal que lo llevan (Next lo
 * aplica a los suyos) y los que estos carguen ('strict-dynamic'). Sin 'unsafe-inline' ni
 * 'unsafe-eval' para scripts en producción.
 */

/** Cabeceras para toda respuesta (next.config.ts las aplica también a archivos y API). */
export const CABECERAS_COMUNES = [
  // HSTS: solo HTTPS durante dos años, subdominios incluidos (A2 5.05.g). El navegador la ignora en HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Los recursos del portal solo se cargan desde el propio portal (no se incrustan en otros sitios).
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
] as const;

export function nonceNuevo(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** CSP de las páginas del portal. */
export function politicaContenido(nonce: string, { desarrollo, https }: { desarrollo: boolean; https: boolean }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desarrollo ? " 'unsafe-eval'" : ""}`,
    // Hojas de estilo: solo las propias. Los atributos style (next/image los usa) se permiten aparte.
    "style-src 'self' 'unsafe-inline'",
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    // Mapa de Contactos (OpenStreetMap).
    "frame-src https://www.openstreetmap.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/**
 * CSP del panel del CMS (/gestion): la interfaz de Payload necesita estilos y scripts en línea.
 * En producción el panel corre aparte, sin acceso público (A2 4.01.g, 5.02.a).
 */
export const POLITICA_PANEL = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
