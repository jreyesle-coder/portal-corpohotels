"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { leer as leerConsentimiento, suscribir as suscribirConsentimiento } from "./aviso-cookies";

type ColaMatomo = unknown[][] & { push: (orden: unknown[]) => void };
declare global {
  interface Window {
    _paq?: ColaMatomo;
  }
}

/**
 * Estadísticas de visitas con Matomo autohospedado (A2 5.04.3), solo si la persona las aceptó en el
 * aviso de cookies (Ley 172-13). Sin cookies (disableCookies) y sin terceros: el script y los
 * registros pasan por el propio portal (/estadisticas/...), que los reenvía a Matomo.
 * Registra páginas vistas, búsquedas internas (palabras clave), descargas y enlaces de salida.
 */
export function Estadisticas({ sitio }: { sitio: number }) {
  const consentimiento = useSyncExternalStore(suscribirConsentimiento, leerConsentimiento, () => "pendiente");
  const ruta = usePathname();
  const parametros = useSearchParams();
  const iniciado = useRef(false);
  const anterior = useRef<string | null>(null);

  useEffect(() => {
    if (consentimiento !== "aceptadas") return;
    const paq = (window._paq ??= [] as unknown as ColaMatomo);
    if (!iniciado.current) {
      iniciado.current = true;
      paq.push(["disableCookies"]);
      paq.push(["setTrackerUrl", "/estadisticas/registro"]);
      paq.push(["setSiteId", String(sitio)]);
      paq.push(["enableLinkTracking"]);
      const s = document.createElement("script");
      s.async = true;
      s.src = "/estadisticas/matomo.js";
      document.head.appendChild(s);
    }
    const url = `${ruta}${parametros.size ? `?${parametros}` : ""}`;
    if (anterior.current === url) return;
    if (anterior.current) paq.push(["setReferrerUrl", window.location.origin + anterior.current]);
    anterior.current = url;
    paq.push(["setCustomUrl", window.location.origin + url]);
    paq.push(["setDocumentTitle", document.title]);
    // Búsquedas internas: alimentan el informe de palabras clave (A2 5.04.3).
    if (ruta === "/buscar" && parametros.get("q")) {
      const total = Number(document.querySelector("[data-total-resultados]")?.getAttribute("data-total-resultados") ?? NaN);
      paq.push(["trackSiteSearch", parametros.get("q"), parametros.get("tipo") || false, Number.isNaN(total) ? false : total]);
    } else {
      paq.push(["trackPageView"]);
    }
  }, [consentimiento, ruta, parametros, sitio]);

  return null;
}
