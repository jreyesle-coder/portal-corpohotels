import "server-only";
import { z } from "zod";

/**
 * Capa única de configuración (paridad local ↔ Azure).
 *
 * El código solo lee `process.env` a través de este módulo:
 * - En local, las variables vienen de `.env` (ver `.env.example`).
 * - En Azure App Service, las mismas variables son App Settings; los secretos se
 *   declaran como referencias de Key Vault (`@Microsoft.KeyVault(SecretUri=...)`),
 *   que App Service resuelve con la identidad administrada (A8 3.03.1).
 *
 * La validación es perezosa: se ejecuta al primer uso y falla con la lista de
 * variables inválidas, sin mostrar sus valores (A2 5.05.j).
 */
const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** URL pública del portal, sin barra final. */
  SITE_URL: z.url().default("http://localhost:3000"),

  /** PostgreSQL (local: Docker; Azure: Flexible Server). */
  DATABASE_URL: z.string().startsWith("postgres"),

  /** Blob Storage (local: Azurite; Azure: cuenta de almacenamiento). */
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  AZURE_STORAGE_CONTAINER: z.string().min(3).default("medios"),

  /** Correo transaccional (local: Mailpit; Azure: Communication Services o relé M365). */
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.email().default("no-responder@corphotels.gob.do"),

  /** Matomo autohospedado (A2 5.04.3). */
  MATOMO_URL: z.url().optional(),
  MATOMO_SITE_ID: z.coerce.number().int().positive().optional(),
});

export type Config = z.infer<typeof esquema>;

let cache: Config | undefined;

export function obtenerConfig(): Config {
  if (cache) return cache;
  const resultado = esquema.safeParse(process.env);
  if (!resultado.success) {
    const variables = [...new Set(resultado.error.issues.map((i) => i.path.join(".")))];
    throw new Error(`Configuración inválida o incompleta: ${variables.join(", ")}`);
  }
  cache = resultado.data;
  return cache;
}

/** URL pública del portal. No exige el resto de variables, para poder usarse al compilar. */
export function urlSitio(): URL {
  return new URL(esquema.shape.SITE_URL.parse(process.env.SITE_URL));
}

/** Variables con problemas, sin valores; para el chequeo de salud. */
export function revisarConfig(): string[] {
  const resultado = esquema.safeParse(process.env);
  return resultado.success
    ? []
    : [...new Set(resultado.error.issues.map((i) => i.path.join(".")))];
}
