import { Poppins } from "next/font/google";
import { OPCION_CABECERA } from "@/contenido/sitio";
import { Cabecera } from "./cabecera";
import { HerramientaAccesibilidad, scriptPreferencias } from "./herramienta-accesibilidad";
import { IdentificadorOficial } from "./identificador-oficial";
import { Pie } from "./pie";

// Tipografía del SDD, servida desde el propio portal (sin solicitudes a terceros en tiempo de ejecución).
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * Documento completo del portal: tres divisiones (cabecera, contenido, pie) iguales en todo el
 * sitio (A2 3.01.b). Lo usan el layout del portal y la página 404 global.
 */
export function MarcoPortal({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable} suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- documento raíz del App Router, no Pages Router */}
      <head>
        {/* Aplica tamaño de texto y contraste guardados antes del primer pintado (A2 7.01.v). */}
        <script dangerouslySetInnerHTML={{ __html: scriptPreferencias }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        {/* Enlace para saltar bloques (A2 7.01.k). */}
        <a
          href="#contenido"
          className="sr-only z-[60] rounded-md bg-primario px-4 py-3 font-semibold text-sobre-primario focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Saltar al contenido principal
        </a>
        <IdentificadorOficial opcion={OPCION_CABECERA} />
        <Cabecera opcion={OPCION_CABECERA} />
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Pie />
        <HerramientaAccesibilidad />
      </body>
    </html>
  );
}
