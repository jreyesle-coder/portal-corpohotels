import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioPasos } from "@/components/sdd/formulario-pasos";
import { PlantillaPagina } from "@/components/sdd/plantilla-pagina";
import { obtenerInstitucion, obtenerServicio } from "@/sitio/datos";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await obtenerServicio((await params).slug);
  return s ? { title: `Solicitar: ${s.nombre}`, robots: { index: false } } : {};
}

/** Solicitud en línea de un servicio: formulario por pasos con número de caso (A2 2.01.b.vi–x). */
export default async function SolicitudServicio({ params }: Props) {
  const servicio = await obtenerServicio((await params).slug);
  if (!servicio?.acceso?.solicitudEnLinea) notFound();
  const i = await obtenerInstitucion();
  const titulo = `Solicitar: ${servicio.nombre}`;
  return (
    <PlantillaPagina
      titulo={titulo}
      migas={[
        { etiqueta: "Servicios", href: "/servicios" },
        { etiqueta: servicio.nombre, href: `/servicios/${servicio.slug}` },
        { etiqueta: "Solicitud" },
      ]}
    >
      <FormularioPasos
        tipo="solicitud"
        servicio={{ slug: servicio.slug, nombre: servicio.nombre }}
        urlCancelar={`/servicios/${servicio.slug}`}
        institucion={{
          telefono: servicio.contactoArea?.telefono ?? i.telefono,
          correo: servicio.contactoArea?.correo ?? i.correo,
          otrasVias: i.atencion.otrasVias,
        }}
      />
    </PlantillaPagina>
  );
}
