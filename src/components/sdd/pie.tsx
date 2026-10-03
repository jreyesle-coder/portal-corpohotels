import Image from "next/image";
import Link from "next/link";
import { informate, organismo, redesSociales, sellosNortic } from "@/contenido/sitio";
import { AnoActual } from "./ano-actual";
import { EnlaceExterno } from "./enlace-externo";
import { IconoChevron, IconoRed } from "./iconos";

/**
 * Pie de página institucional, tema oscuro con isotipo (A2 3.02.f y 3.02.f.i, Figura 3.13;
 * móvil 3.04.c, Figura 3.30). Solo contiene los elementos que fija la norma.
 */
export function Pie() {
  return (
    <footer className="bg-oscuro text-sobre-oscuro" data-pie>
      <div className="contenedor grid gap-8 py-10 lg:grid-cols-[auto_1fr] lg:gap-10">
        <div className="flex items-center gap-6 lg:border-r lg:border-sobre-oscuro/30 lg:pr-10">
          <Image
            src="/brand/icono-blanco.svg"
            alt={`Isotipo de ${organismo.siglas}`}
            width={56}
            height={56}
            className="size-[56px]"
            data-medida="isotipo"
          />
          <Image
            src="/brand/gobierno-blanco.svg"
            alt="Gobierno de la República Dominicana"
            width={200}
            height={80}
            className="h-[75px] w-auto esc:h-[80px]"
            data-medida="logo-gobierno"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm esc:grid-cols-4">
          <Columna titulo="Conócenos">
            <p>
              {organismo.nombre} ({organismo.siglas})
            </p>
          </Columna>
          <Columna titulo="Contáctanos">
            <ul className="space-y-1">
              <li>
                Teléfono: <a href={`tel:+1${organismo.telefono.replace(/\D/g, "")}`} className="underline underline-offset-2">{organismo.telefono}</a>
              </li>
              {organismo.correo && (
                <li>
                  Correo: <a href={`mailto:${organismo.correo}`} className="underline underline-offset-2">{organismo.correo}</a>
                </li>
              )}
            </ul>
          </Columna>
          <Columna titulo="Búscanos">
            <address className="not-italic">{organismo.direccion}</address>
          </Columna>
          <Columna titulo="Infórmate">
            <ul className="space-y-1">
              {informate.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="underline underline-offset-2 hover:no-underline">
                    {e.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </Columna>
        </div>
      </div>

      {sellosNortic.length > 0 && (
        <div className="bg-fondo text-texto">
          {/* Escritorio: fila de sellos de 100×100 px. */}
          <div className="contenedor hidden py-5 esc:block">
            <h2 className="mb-3 text-sm font-semibold">Sellos</h2>
            <Sellos />
          </div>
          {/* Móvil: pestaña desplegable de certificaciones (A2 3.04.c). */}
          <details className="group contenedor py-3 esc:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              Certificaciones obtenidas
              <IconoChevron width={18} height={18} className="group-open:rotate-180" />
            </summary>
            <div className="pt-4">
              <Sellos />
            </div>
          </details>
        </div>
      )}

      <div className="border-t border-sobre-oscuro/30">
        <div className="contenedor flex flex-col items-center gap-3 py-4 text-center text-xs esc:flex-row esc:justify-between esc:text-left">
          <p>
            © <AnoActual /> {organismo.siglas}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase">Síguenos</h2>
            <ul className="flex items-center gap-2">
              {redesSociales.map((r, i) => (
                <li key={r.red} className={i >= 4 ? "hidden esc:block" : undefined}>
                  <EnlaceExterno
                    href={r.url}
                    className="flex size-7 items-center justify-center rounded-full bg-white"
                  >
                    <IconoRed red={r.red} />
                    <span className="sr-only">
                      {r.nombre} de {organismo.siglas}
                    </span>
                  </EnlaceExterno>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Columna({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold tracking-wide uppercase">{titulo}</h2>
      <div className="text-sobre-oscuro-suave">{children}</div>
    </div>
  );
}

function Sellos() {
  return (
    <ul className="flex flex-wrap gap-3">
      {sellosNortic.map((s) => (
        <li key={s.nombre}>
          <EnlaceExterno href={s.url}>
            <Image src={s.imagen} alt={s.nombre} width={100} height={100} className="size-[100px]" />
          </EnlaceExterno>
        </li>
      ))}
    </ul>
  );
}
