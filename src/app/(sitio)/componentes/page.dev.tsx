import type { Metadata } from "next";
import Link from "next/link";
import { Alerta, Boton, Campo, Destacado, Prosa } from "@/components/sdd/base";
import { EnlaceExterno } from "@/components/sdd/enlace-externo";
import { RastroNavegacion } from "@/components/sdd/rastro-navegacion";

export const metadata: Metadata = { title: "Catálogo de componentes", robots: { index: false } };

/**
 * Catálogo de componentes SDD (A2 1.06.a.iii) y de la división de contenido en cinco paneles
 * (A2 3.02.e). Solo existe en desarrollo: la extensión .dev.tsx se excluye al compilar (A2 4.01.h).
 */
export default function Componentes() {
  return (
    <>
      <RastroNavegacion migas={[{ etiqueta: "Catálogo de componentes" }]} />
      <div className="contenedor grid gap-8 py-8 esc:grid-cols-[14rem_1fr_16rem]">
        <nav aria-label="Panel izquierdo: secciones internas" className="text-sm">
          <h2 className="mb-2 font-semibold text-titulo">Panel izquierdo</h2>
          <ul className="space-y-1">
            {["Encabezados y texto", "Botones", "Alertas", "Formularios"].map((s) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replaceAll(" ", "-")}`} className="text-primario underline underline-offset-2">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">
          <h1 className="text-3xl font-bold text-titulo">Catálogo de componentes</h1>

          <section id="encabezados-y-texto" aria-labelledby="t-texto">
            <Prosa>
              <h2 id="t-texto">Encabezados y texto</h2>
              <p>
                Párrafo de ejemplo con un <Link href="/">enlace interno al inicio</Link> y un{" "}
                <EnlaceExterno href="https://ogtic.gob.do/">enlace externo a la OGTIC</EnlaceExterno>.
              </p>
              <h3>Lista</h3>
              <ul>
                <li>Elemento de lista no ordenada</li>
                <li>Segundo elemento</li>
              </ul>
              <ol>
                <li>Primer paso</li>
                <li>Segundo paso</li>
              </ol>
            </Prosa>
            <div className="mt-6 max-w-3xl">
              <Destacado titulo="Destacado">Bloque para información relevante dentro del contenido.</Destacado>
            </div>
          </section>

          <section id="botones" aria-labelledby="t-botones" className="space-y-3">
            <h2 id="t-botones" className="text-2xl font-semibold text-titulo">Botones</h2>
            <div className="flex flex-wrap gap-3">
              <Boton>Primario</Boton>
              <Boton variante="secundario">Secundario</Boton>
              <Boton variante="texto">Texto</Boton>
              <Boton disabled>Deshabilitado</Boton>
            </div>
          </section>

          <section id="alertas" aria-labelledby="t-alertas" className="max-w-3xl space-y-3">
            <h2 id="t-alertas" className="text-2xl font-semibold text-titulo">Alertas</h2>
            <Alerta tipo="info">Su solicitud se procesa en un máximo de 5 días laborables.</Alerta>
            <Alerta tipo="exito">Su sugerencia fue recibida.</Alerta>
            <Alerta tipo="advertencia">Revise los datos antes de continuar.</Alerta>
            <Alerta tipo="error">El correo electrónico no tiene un formato válido.</Alerta>
          </section>

          <section id="formularios" aria-labelledby="t-form" className="max-w-xl space-y-4">
            <h2 id="t-form" className="text-2xl font-semibold text-titulo">Formularios</h2>
            <p className="text-sm text-texto-suave">Los campos marcados con * son obligatorios.</p>
            <Campo id="nombre" etiqueta="Nombre completo" required maxLength={120} autoComplete="name" />
            <Campo
              id="correo"
              etiqueta="Correo electrónico"
              type="email"
              required
              ayuda="Le enviaremos el número de caso a este correo."
              error="Escriba un correo con el formato nombre@dominio.com"
              defaultValue="correo-invalido"
              autoComplete="email"
            />
          </section>
        </div>

        <aside aria-label="Panel derecho" className="text-sm">
          <h2 className="mb-2 font-semibold text-titulo">Panel derecho</h2>
          <p>Información relacionada con el contenido de la sección.</p>
        </aside>
      </div>
      <section aria-label="Panel inferior" className="border-t border-borde bg-superficie">
        <div className="contenedor py-6 text-sm">
          <h2 className="font-semibold text-titulo">Panel inferior</h2>
          <p>Elementos organizados de relevancia para el usuario.</p>
        </div>
      </section>
    </>
  );
}
