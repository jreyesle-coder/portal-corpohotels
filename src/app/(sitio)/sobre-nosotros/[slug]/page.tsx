import type { Metadata } from "next";
import { metadatosPagina, PaginaCms, seccionSobreNosotros } from "@/sitio/pagina-cms";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return metadatosPagina((await params).slug);
}

/** Subsecciones de «Sobre nosotros»: ¿Quiénes somos?, Historia, Organigrama, Conoce al Gerente General. */
export default async function SubseccionSobreNosotros({ params }: Props) {
  const { slug } = await params;
  return (
    <PaginaCms
      slug={slug}
      migas={[{ etiqueta: "Sobre nosotros", href: "/sobre-nosotros" }]}
      seccion={await seccionSobreNosotros(`/sobre-nosotros/${slug}`)}
    />
  );
}
