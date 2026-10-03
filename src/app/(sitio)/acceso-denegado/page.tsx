import type { Metadata } from "next";
import { Alerta } from "@/components/sdd/base";
import { RastroNavegacion } from "@/components/sdd/rastro-navegacion";

export const metadata: Metadata = { title: "Acceso no autorizado", robots: { index: false } };

const MENSAJES: Record<string, { titulo: string; texto: string }> = {
  "sin-mfa": {
    titulo: "Falta la verificación en dos pasos",
    texto:
      "Su cuenta inició sesión sin un segundo factor de autenticación. Active la verificación en dos pasos de su cuenta institucional y vuelva a intentarlo.",
  },
  "sin-rol": {
    titulo: "Su cuenta no tiene un rol asignado",
    texto:
      "Su cuenta institucional no tiene permisos en el gestor de contenidos. Solicite el rol a la División de Tecnologías de la Información y Comunicación.",
  },
  inactivo: {
    titulo: "Su acceso está desactivado",
    texto: "El acceso de esta cuenta al gestor de contenidos fue desactivado. Comuníquese con la División TIC.",
  },
  error: {
    titulo: "No fue posible iniciar sesión",
    texto: "La verificación de la cuenta no se completó o tardó demasiado. Vuelva a intentarlo desde el inicio.",
  },
};

/** Resultado de un inicio de sesión rechazado en el CMS. No revela detalles técnicos (A2 5.05.j). */
export default async function AccesoDenegado({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const { titulo, texto } = MENSAJES[motivo ?? ""] ?? MENSAJES.error;
  return (
    <>
      <RastroNavegacion migas={[{ etiqueta: "Acceso no autorizado" }]} />
      <div className="contenedor max-w-3xl space-y-6 py-10">
        <h1 className="text-2xl font-bold text-titulo esc:text-3xl">Acceso no autorizado</h1>
        <Alerta tipo="error" titulo={titulo}>
          {texto}
        </Alerta>
      </div>
    </>
  );
}
