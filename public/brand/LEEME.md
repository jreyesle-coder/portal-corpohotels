# Activos de marca

| Archivo | Origen | Uso |
| --- | --- | --- |
| `gobierno-azul.svg`, `gobierno-blanco.svg` | Logo oficial «Gobierno de la República Dominicana», publicado por la OGTIC (`ogtic.gob.do/wp-content/uploads/2026/07/LOGO_GOB_hor_*.svg`), con el margen recortado | Pie: 80 px escritorio, 75 px móvil (A2 3.02.f, 3.04.c) |
| `icono-azul.png`, `icono-blanco.png` | **Provisional (novedad N-01):** escudo de CORPHOTELS extraído del banner del portal actual (66×102 px de origen) | Cabecera opción A (40 px escritorio, 44 px móvil); isotipo del pie (56 px); fuente de favicon e íconos |

Al recibir el kit de marca oficial, reemplazar los PNG del escudo por los SVG del kit (`icono-azul.svg`,
`icono-blanco.svg`), actualizar las rutas en `cabecera.tsx`, `pie.tsx`, `cms/componentes/marca.tsx` y
`scripts/generar-iconos.mjs`, y ejecutar `npm run iconos`.

Los archivos OTF de Futura PT no se suben al repositorio.
