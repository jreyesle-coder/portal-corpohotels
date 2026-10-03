import Link from "next/link";
import { menuPrincipal, organismo } from "@/contenido/sitio";

/**
 * Portada provisional de S0: solo título (A2 7.01.m) y accesos a las secciones obligatorias.
 * Servicios, noticias y banners (A2 3.02.e.ii.a) llegan en S2 desde el CMS.
 */
export default function Inicio() {
  const secciones = menuPrincipal.filter((s) => s.href !== "/");
  return (
    <div className="contenedor py-10">
      <h1 className="mb-8 max-w-4xl text-2xl font-bold text-titulo esc:text-3xl">{organismo.tituloPortada}</h1>
      <nav aria-label="Secciones del portal">
        <ul className="grid gap-4 sm:grid-cols-2 esc:grid-cols-3">
          {secciones.map((s) => (
            <li key={s.href}>
              <Link
                href={s.hijos?.[0]?.href ?? s.href}
                className="block h-full rounded-lg border border-borde bg-superficie p-5 text-lg font-semibold text-primario hover:border-primario hover:underline"
              >
                {s.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
