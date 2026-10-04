import type { GlobalConfig } from "payload";
import { con } from "../acceso";

/**
 * Ajustes de la portada. El avance automático del carrusel es una decisión de TIC (novedad N-34):
 * la A2 7.01.w no admite acciones automáticas no iniciadas por el usuario; si la auditoría lo
 * objeta, se desactiva aquí y el carrusel cambia solo con las flechas.
 */
export const Portada: GlobalConfig = {
  slug: "portada",
  label: "Ajustes de la portada",
  admin: { group: "Portada" },
  access: { read: () => true, update: con("publicador", "administrador") },
  fields: [
    {
      name: "avanceAutomatico",
      label: "El carrusel principal avanza solo",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Siempre con botón de pausa; se detiene al pasar el mouse o con el teclado." },
    },
    {
      name: "segundos",
      label: "Segundos por diapositiva",
      type: "number",
      min: 5,
      max: 20,
      defaultValue: 7,
    },
  ],
};
