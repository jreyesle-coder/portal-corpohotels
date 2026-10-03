import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Cifrado de datos personales en reposo (A2 5.05.e, Ley 172-13): AES-256-GCM por campo, con la
 * clave CLAVE_CIFRADO_DATOS (32 bytes en base64; en Azure, secreto de Key Vault). Se suma al
 * cifrado del disco de PostgreSQL Flexible Server: quien obtenga un respaldo o acceda a la base de
 * datos no lee nombres, correos, teléfonos ni mensajes.
 *
 * Formato: "v1:<iv>:<etiqueta>:<texto cifrado>", todo en base64url.
 */
const PREFIJO = "v1";

function clave(base64: string): Buffer {
  const k = Buffer.from(base64, "base64");
  if (k.length !== 32) throw new Error("CLAVE_CIFRADO_DATOS debe tener 32 bytes en base64");
  return k;
}

export function cifrar(texto: string, claveBase64: string): string {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", clave(claveBase64), iv);
  const datos = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  return [PREFIJO, iv.toString("base64url"), cifrador.getAuthTag().toString("base64url"), datos.toString("base64url")].join(":");
}

export function descifrar(valor: string, claveBase64: string): string {
  const [prefijo, iv, etiqueta, datos] = valor.split(":");
  if (prefijo !== PREFIJO || !iv || !etiqueta || datos === undefined) throw new Error("Valor cifrado con formato desconocido");
  const descifrador = createDecipheriv("aes-256-gcm", clave(claveBase64), Buffer.from(iv, "base64url"));
  descifrador.setAuthTag(Buffer.from(etiqueta, "base64url"));
  return Buffer.concat([descifrador.update(Buffer.from(datos, "base64url")), descifrador.final()]).toString("utf8");
}

export const estaCifrado = (valor: unknown): valor is string => typeof valor === "string" && valor.startsWith(`${PREFIJO}:`);
