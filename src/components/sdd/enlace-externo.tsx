import type { AnchorHTMLAttributes } from "react";

/** Enlaces externos y descargas en pestaña nueva, avisando al lector de pantalla (A2 2.01.g). */
export function EnlaceExterno({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (abre en una pestaña nueva)</span>
    </a>
  );
}
