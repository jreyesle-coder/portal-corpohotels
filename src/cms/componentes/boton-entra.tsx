import { RUTA_PANEL } from "@/cms/rutas";

type Props = { searchParams?: Record<string, string | string[] | undefined> };

/**
 * Único acceso al panel: cuenta institucional de Microsoft (Entra ID) con doble factor
 * (A2 5.05.o, A8 3.01.3). No hay usuario ni contraseña locales.
 */
export function BotonEntra({ searchParams }: Props) {
  const destino = typeof searchParams?.redirect === "string" ? searchParams.redirect : RUTA_PANEL;
  const href = `/auth/entra/iniciar?destino=${encodeURIComponent(destino)}`;
  return (
    <div style={{ display: "grid", gap: "1rem", textAlign: "center" }}>
      <p style={{ margin: 0 }}>
        Acceso exclusivo para el personal autorizado de CORPHOTELS con su cuenta institucional y
        verificación en dos pasos.
      </p>
      <a
        href={href}
        className="btn btn--style-primary btn--size-large"
        style={{ display: "inline-flex", justifyContent: "center", textDecoration: "none" }}
      >
        Iniciar sesión con Microsoft
      </a>
    </div>
  );
}
