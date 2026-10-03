import type { Metadata } from "next";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { FormularioPasos } from "@/components/sdd/formulario-pasos";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { obtenerInstitucion } from "@/sitio/datos";

export const metadata: Metadata = {
  title: "Quejas y sugerencias",
  description: "Envíe a CORPHOTELS sus quejas, sugerencias o felicitaciones y reciba un número de caso.",
};

/** Formulario de quejas y sugerencias con número de caso (A2 2.01.b.xi). */
export default async function Sugerencias() {
  const i = await obtenerInstitucion();
  return (
    <PlantillaPagina
      titulo="Quejas y sugerencias"
      migas={[{ etiqueta: "Contactos", href: "/contactos" }, { etiqueta: "Quejas y sugerencias" }]}
    >
      <p className="mb-6 max-w-2xl">
        Su opinión nos ayuda a mejorar. También puede presentar denuncias, quejas, reclamaciones y sugerencias a cualquier
        institución del Estado en la{" "}
        <EnlaceExterno href="https://www.311.gob.do/" className="font-semibold text-primario underline">
          Línea 311 de Atención Ciudadana
        </EnlaceExterno>
        .
      </p>
      <FormularioPasos tipo="sugerencia" urlCancelar="/contactos" institucion={{ telefono: i.telefono, correo: i.correo, otrasVias: i.atencion.otrasVias }} />
    </PlantillaPagina>
  );
}
