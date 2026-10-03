import type { NextConfig } from "next";

// INCLUIR_CATALOGO=1 lo compila también en producción, solo para las pruebas automáticas.
const desarrollo = process.env.NODE_ENV !== "production" || process.env.INCLUIR_CATALOGO === "1";

const nextConfig: NextConfig = {
  // Imagen Docker mínima: la misma en local y en Azure App Service.
  output: "standalone",
  poweredByHeader: false,
  // Sin indicador de desarrollo: altera el orden de foco y las pruebas de accesibilidad.
  devIndicators: false,
  // Las páginas `*.dev.tsx` (catálogo de componentes) solo existen en desarrollo (A2 4.01.h).
  pageExtensions: desarrollo ? ["dev.tsx", "tsx", "ts"] : ["tsx", "ts"],
  experimental: {
    // 404 renderizado en servidor para toda ruta inexistente, con varios layouts raíz (portal y CMS).
    globalNotFound: true,
  },
};

export default nextConfig;
