import type { SVGProps } from "react";
import { siFacebook, siInstagram, siX, siYoutube } from "simple-icons";
import type { RedSocial } from "@/contenido/sitio";

type Props = SVGProps<SVGSVGElement>;

const base = (props: Props) => ({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const IconoLupa = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconoChevron = (p: Props) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconoMenu = (p: Props) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconoCerrar = (p: Props) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconoCuadricula = (p: Props) => (
  <svg {...base({ ...p, fill: "currentColor", stroke: "none" })}>
    {[3, 10, 17].flatMap((y) =>
      [3, 10, 17].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" />),
    )}
  </svg>
);

export const IconoAccesibilidad = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="4.5" r="1.5" />
    <path d="M5 8.5 12 10l7-1.5M12 10v5m0 0-3 6m3-6 3 6" />
  </svg>
);

export const IconoInfo = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const IconoExito = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

export const IconoAdvertencia = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const IconoError = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

const iconosRedes = { facebook: siFacebook, instagram: siInstagram, x: siX, youtube: siYoutube };

/** Ícono oficial de la red, a todo color, máximo 16 px (A2 3.02.f). */
export function IconoRed({ red, tamano = 16 }: { red: RedSocial["red"]; tamano?: number }) {
  const icono = iconosRedes[red];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={tamano}
      height={tamano}
      fill={`#${icono.hex}`}
      aria-hidden
      focusable={false}
    >
      <path d={icono.path} />
    </svg>
  );
}
