import type { CollectionBeforeOperationHook } from "payload";
import { aSlug } from "@/lib/slug";

/** Nombres de archivo en minúsculas, sin tildes ni espacios: forman parte de la URL (A2 6.01.f, h). */
export const normalizarNombreArchivo: CollectionBeforeOperationHook = ({ req, operation, args }) => {
  if ((operation === "create" || operation === "update") && req.file?.name) {
    const punto = req.file.name.lastIndexOf(".");
    const base = punto > 0 ? req.file.name.slice(0, punto) : req.file.name;
    const extension = punto > 0 ? req.file.name.slice(punto + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
    req.file.name = `${aSlug(base, 100) || "archivo"}${extension ? `.${extension}` : ""}`;
  }
  return args;
};

const TIPOS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-powerpoint": "PowerPoint",
  // Word, Excel y PowerPoint 97-2003 (.doc, .xls, .ppt): el CMS los detecta por su contenido con este tipo.
  "application/x-cfb": "Office 97-2003",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "application/vnd.oasis.opendocument.text": "ODT",
  "application/vnd.oasis.opendocument.spreadsheet": "ODS",
  "text/csv": "CSV",
  "application/json": "JSON",
  "application/xml": "XML",
  "application/zip": "ZIP",
  "image/jpeg": "JPG",
  "image/png": "PNG",
};

/** Formatos de documento permitidos: ofimáticos, abiertos (NORTIC A3) y comprimidos. */
export const TIPOS_DOCUMENTO = Object.keys(TIPOS);

const OFFICE_ANTIGUO: Record<string, string> = { doc: "Word", xls: "Excel", ppt: "PowerPoint" };

export function tipoLegible(mime?: string | null, nombreArchivo?: string | null): string {
  if (!mime) return "Archivo";
  if (mime === "application/x-cfb") return OFFICE_ANTIGUO[nombreArchivo?.split(".").pop()?.toLowerCase() ?? ""] ?? TIPOS[mime];
  return TIPOS[mime] ?? mime.split("/")[1]?.toUpperCase() ?? "Archivo";
}

/** Tamaño en unidades del SI con coma decimal (A2 2.01.c: unidades SI). */
export function tamanoLegible(bytes?: number | null): string {
  if (!bytes && bytes !== 0) return "—";
  const unidades = ["B", "kB", "MB", "GB"];
  let valor = bytes;
  let i = 0;
  while (valor >= 1000 && i < unidades.length - 1) {
    valor /= 1000;
    i++;
  }
  return `${valor.toLocaleString("es-DO", { maximumFractionDigits: i === 0 ? 0 : 1 })} ${unidades[i]}`;
}
