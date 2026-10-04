"use client";

import Link from "next/link";

/**
 * Último recurso si falla el propio marco del portal (A2 5.05.j): sin detalles técnicos y con los
 * datos mínimos para seguir. No usa componentes del portal porque pueden ser la causa del fallo.
 */
export default function ErrorGlobal({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", color: "#1f2937" }}>
        <h1 style={{ color: "#003876" }}>El portal no está disponible en este momento</h1>
        <p>Intente de nuevo en unos minutos. Para comunicarse con CORPHOTELS: (809) 688-3417.</p>
        <p>
          <Link href="/" style={{ color: "#0f539c" }}>
            Ir al inicio
          </Link>
        </p>
        {error.digest && <p style={{ fontSize: "0.875rem" }}>Referencia del error: {error.digest}</p>}
      </body>
    </html>
  );
}
