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
 * No se importa desde componentes de cliente: los valores solo existen en el servidor.
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
  /** URL base pública de la cuenta de almacenamiento (local: Azurite). */
  AZURE_STORAGE_BASE_URL: z.url().default("http://localhost:10000/devstoreaccount1"),

  /** Correo transaccional (local: Mailpit; Azure: Communication Services o relé M365). */
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.email().default("no-responder@corphotels.gob.do"),

  /** Matomo autohospedado (A2 5.04.3). */
  MATOMO_URL: z.url().optional(),
  MATOMO_SITE_ID: z.coerce.number().int().positive().optional(),

  /** Clave AES-256 (32 bytes en base64) para cifrar datos personales de formularios (A2 5.05.e). */
  CLAVE_CIFRADO_DATOS: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, "32 bytes en base64"),

  /**
   * "1" en producción: ningún servicio se publica ni se muestra sin la ficha A5 completa
   * (A2 4.02.b). "0" en desarrollo y QA mientras las áreas completan las fichas (decisión de TIC).
   */
  EXIGIR_FICHA_A5_COMPLETA: z.enum(["0", "1"]).default("0"),

  /** Envíos de formularios permitidos por IP cada 10 minutos (antispam; el WAF complementa). */
  LIMITE_ENVIOS_POR_IP: z.coerce.number().int().positive().default(5),

  /** Correo que recibe los avisos de nuevos casos (contacto, sugerencias, solicitudes). */
  CORREO_ATENCION: z.email().default("info@corphotels.gob.do"),

  /** Clave del CMS: firma sesiones y cifra datos internos de Payload. Mínimo 32 caracteres. */
  PAYLOAD_SECRET: z.string().min(32),

  /**
   * "1" en la app del panel (privada) y "0" en el portal público (A2 4.01.g): con "0" no se sirven
   * el panel, el inicio de sesión ni la API de escritura.
   */
  PANEL_HABILITADO: z.enum(["0", "1"]).default("1"),

  /**
   * Proveedor OpenID Connect del CMS. Azure: Entra ID corporativo,
   * `https://login.microsoftonline.com/<tenant>/v2.0`. Local: simulador de Entra en Docker.
   */
  OIDC_ISSUER: z.url(),
  OIDC_CLIENT_ID: z.string().min(1),
  OIDC_CLIENT_SECRET: z.string().min(1),
  /**
   * Cómo se comprueba el doble factor en el token (A2 5.05.o, A8 3.01.3):
   * - `amr`: el reclamo `amr` debe contener "mfa".
   * - `acrs:<id>`: se solicita el contexto de autenticación <id> de acceso condicional y el
   *   reclamo `acrs` debe contenerlo (método recomendado por Microsoft para exigir MFA a la app).
   */
  OIDC_VERIFICACION_MFA: z
    .string()
    .regex(/^(amr|acrs:c([1-9]|[1-9][0-9]))$/)
    .default("amr"),
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

/**
 * Durante `next build` (por ejemplo, al construir la imagen Docker) no existen secretos: la imagen
 * es la misma para todos los ambientes y la configuración llega al arrancar. En esa fase se usan
 * valores inertes que nunca se conectan a nada.
 */
export function obtenerConfigCms(): Config {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return esquema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "postgres://compilacion@localhost:5432/compilacion",
      AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING ?? "UseDevelopmentStorage=true",
      SMTP_HOST: process.env.SMTP_HOST ?? "localhost",
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? "compilacion-".padEnd(48, "x"),
      OIDC_ISSUER: process.env.OIDC_ISSUER ?? "https://login.microsoftonline.com/compilacion/v2.0",
      OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID ?? "compilacion",
      OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET ?? "compilacion",
      CLAVE_CIFRADO_DATOS: process.env.CLAVE_CIFRADO_DATOS ?? Buffer.alloc(32).toString("base64"),
    });
  }
  return obtenerConfig();
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
