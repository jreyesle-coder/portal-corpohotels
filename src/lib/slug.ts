/**
 * URL amigables: cortas, en minúsculas, sin tildes ni caracteres especiales (A2 6.01.f, 6.01.h).
 */
export const PATRON_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function aSlug(texto: string, largoMaximo = 80): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, largoMaximo)
    .replace(/-+$/g, "");
}
