/* eslint-disable @next/next/no-img-element -- el panel de Payload renderiza fuera del optimizador de imágenes */

/** Identidad CORPHOTELS en el panel del CMS (pantalla de acceso y barra lateral). */
export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <img src="/brand/icono-azul.svg" alt="" width={48} height={48} />
      <span style={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.2, textAlign: "left" }}>
        CORPHOTELS
        <br />
        <span style={{ fontWeight: 400, fontSize: "0.9rem" }}>Gestor de contenidos</span>
      </span>
    </div>
  );
}

export function Icono() {
  return <img src="/brand/icono-azul.svg" alt="CORPHOTELS" width={24} height={24} />;
}
