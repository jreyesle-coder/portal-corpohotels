import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import { CABECERAS_COMUNES } from "./src/seguridad/cabeceras";

// INCLUIR_CATALOGO=1 lo compila también en producción, solo para las pruebas automáticas.
const desarrollo = process.env.NODE_ENV !== "production" || process.env.INCLUIR_CATALOGO === "1";

const nextConfig: NextConfig = {
  // Imagen Docker mínima: la misma en local y en Azure App Service.
  output: "standalone",
  poweredByHeader: false,
  // Sin indicador de desarrollo: altera el orden de foco y las pruebas de accesibilidad.
  devIndicators: false,
  // Las páginas `*.dev.tsx` (catálogo de componentes) solo existen en desarrollo (A2 4.01.h).
  pageExtensions: desarrollo ? ["dev.tsx", "tsx", "ts", "js"] : ["tsx", "ts", "js"],
  images: {
    // Imágenes del CMS servidas por Payload con su control de acceso.
    localPatterns: [{ pathname: "/api/medios/file/**" }, { pathname: "/sdd/**" }, { pathname: "/brand/**" }],
  },
  // Cabeceras de seguridad en toda respuesta, también archivos y API (A8 3.03). La CSP de las
  // páginas, con nonce por solicitud, la pone el proxy.
  async headers() {
    return [{ source: "/:path*", headers: [...CABECERAS_COMUNES] }];
  },
  experimental: {
    // 404 renderizado en servidor para toda ruta inexistente, con varios layouts raíz (portal y CMS).
    globalNotFound: true,
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
