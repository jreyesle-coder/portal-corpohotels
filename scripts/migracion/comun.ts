/** Tipos y utilidades compartidas por los scripts de migración (S5). */
import path from "node:path";

export { HOST } from "../../src/migracion/normalizar";
export const DIR_MIGRACION = path.resolve(import.meta.dirname, "../../migracion");
export const DIR_CACHE = path.join(DIR_MIGRACION, "cache");
export const ARCHIVO_INVENTARIO = path.join(DIR_MIGRACION, "datos", "inventario.json");
/** URL históricas del dominio según el Internet Archive (y, si TIC la entrega, la exportación de Search Console). */
export const ARCHIVO_URLS_INDEXADAS = path.join(DIR_MIGRACION, "datos", "urls-indexadas.txt");

export type PaginaAnterior = {
  url: string;
  estado: number;
  final: string;
  tipo: "phoca" | "k2-item" | "k2-lista" | "articulo" | "otro";
  titulo: string;
  html: string;
  enlaces: string[];
  fecha?: string;
  imagen?: string;
  categoria?: number | null;
};

export type Sitio = "portal" | "transparencia";

export type ArchivoPhoca = {
  sitio: Sitio;
  id: number;
  alias: string;
  titulo: string;
  archivo: string;
  tamano: string;
  fecha: string;
  categoria: number | null;
  rutaCategoria: string;
  urlDescarga: string;
};

export type CategoriaPhoca = { sitio: Sitio; id: number | null; titulo: string; ruta: string; hijas: number[]; menu?: boolean };

export type Inventario = {
  generado: string;
  fuente: string;
  paginas: PaginaAnterior[];
  categorias: CategoriaPhoca[];
  archivos: ArchivoPhoca[];
};

export { normalizarUrl } from "../../src/migracion/normalizar";
