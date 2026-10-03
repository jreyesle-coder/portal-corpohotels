"use client";

/**
 * Botones de imprimir, exportar a PDF y enviar por correo (A2 2.01.e).
 * El PDF lo genera el servidor (ruta /exportar-pdf) con el contenido de la página.
 */
export function HerramientasPagina({ titulo, urlPdf }: { titulo: string; urlPdf?: string }) {
  const clase =
    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-borde px-3 text-sm font-semibold text-primario hover:border-primario hover:bg-primario-claro";
  const correo = () => {
    const asunto = encodeURIComponent(`${titulo} | CORPHOTELS`);
    const cuerpo = encodeURIComponent(`Le comparto esta página del portal de CORPHOTELS:\n\n${titulo}\n${window.location.href}`);
    window.location.href = `mailto:?subject=${asunto}&body=${cuerpo}`;
  };
  return (
    <div role="group" aria-label="Herramientas de la página" className="flex flex-wrap gap-2 print:hidden" data-herramientas>
      <button type="button" onClick={() => window.print()} className={clase}>
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z" />
        </svg>
        Imprimir
      </button>
      {urlPdf && (
        <a href={urlPdf} className={clase} download>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M12 11v6m-3-3 3 3 3-3" />
          </svg>
          Descargar en PDF
        </a>
      )}
      <button type="button" onClick={correo} className={clase}>
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
        </svg>
        Enviar por correo
      </button>
    </div>
  );
}
