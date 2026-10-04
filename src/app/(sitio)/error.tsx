"use client";

import Link from "next/link";

/**
 * Error inesperado dentro del portal (A2 5.05.j): mensaje institucional, sin detalles técnicos del
 * servidor, rutas ni claves. El identificador solo sirve para buscar el caso en los registros.
 */
export default function ErrorPortal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="contenedor py-12">
      <h1 className="mb-4 text-2xl font-bold text-titulo esc:text-3xl">No pudimos mostrar esta página</h1>
      <p className="mb-6 max-w-2xl text-lg">
        Ocurrió un problema al cargar la información. Intente de nuevo en unos minutos. Si el problema continúa,
        comuníquese con nosotros.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 cursor-pointer rounded-md bg-primario px-5 font-semibold text-sobre-primario"
        >
          Intentar de nuevo
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-md border-2 border-primario px-5 font-semibold text-primario">
          Ir al inicio
        </Link>
        <Link href="/contactos" className="inline-flex min-h-11 items-center rounded-md border-2 border-primario px-5 font-semibold text-primario">
          Contactos
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-sm text-texto-suave">Referencia del error: {error.digest}</p>}
    </div>
  );
}
