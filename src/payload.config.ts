import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { azureStorage } from "@payloadcms/storage-azure";
import { es } from "@payloadcms/translations/languages/es";
import { buildConfig } from "payload";
import sharp from "sharp";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { Banners } from "@/cms/colecciones/banners";
import { Bitacora } from "@/cms/colecciones/bitacora";
import { Casos } from "@/cms/colecciones/casos";
import { Documentos } from "@/cms/colecciones/documentos";
import { Encuestas } from "@/cms/colecciones/encuestas";
import { Medios } from "@/cms/colecciones/medios";
import { Menus } from "@/cms/colecciones/menus";
import { Noticias } from "@/cms/colecciones/noticias";
import { Paginas } from "@/cms/colecciones/paginas";
import { PreguntasFrecuentes } from "@/cms/colecciones/preguntas";
import { Servicios } from "@/cms/colecciones/servicios";
import { Categorias, Etiquetas } from "@/cms/colecciones/taxonomias";
import { Usuarios } from "@/cms/colecciones/usuarios";
import { Institucion } from "@/cms/globales/institucion";
import { RUTA_PANEL } from "@/cms/rutas";
import { obtenerConfigCms } from "@/config";
import { migrations } from "./migraciones";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const c = obtenerConfigCms();

/**
 * Payload CMS 3 (A2 5.02.a): categorías y etiquetas, menús, medios, usuarios con roles,
 * complementos oficiales, URL amigables y herramientas SEO, sobre PostgreSQL y Blob Storage.
 */
export default buildConfig({
  serverURL: c.SITE_URL,
  secret: c.PAYLOAD_SECRET,
  cookiePrefix: "cph",
  // Protección CSRF de la sesión por cookie: solo se aceptan peticiones desde el propio sitio (A2 5.05.d.ii).
  csrf: [c.SITE_URL],
  cors: [c.SITE_URL],
  telemetry: false,
  routes: { admin: RUTA_PANEL, api: "/api" },
  graphQL: { disable: true },
  admin: {
    user: Usuarios.slug,
    meta: { titleSuffix: " · CMS CORPHOTELS", robots: "noindex, nofollow" },
    dateFormat: "dd/MM/yyyy HH:mm",
    components: {
      beforeLogin: ["@/cms/componentes/boton-entra#BotonEntra"],
      graphics: { Logo: "@/cms/componentes/marca#Logo", Icon: "@/cms/componentes/marca#Icono" },
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: "es" },
  collections: [
    Noticias,
    Paginas,
    Servicios,
    Banners,
    PreguntasFrecuentes,
    Categorias,
    Etiquetas,
    Menus,
    Medios,
    Documentos,
    Casos,
    Encuestas,
    Usuarios,
    Bitacora,
  ],
  globals: [Institucion],
  editor: lexicalEditor(),
  // Correo transaccional (local: Mailpit; Azure: Communication Services o relé de Microsoft 365).
  email: nodemailerAdapter({
    defaultFromAddress: c.SMTP_FROM,
    defaultFromName: "CORPHOTELS",
    skipVerify: true,
    transportOptions: {
      host: c.SMTP_HOST,
      port: c.SMTP_PORT,
      secure: c.SMTP_PORT === 465,
      auth: c.SMTP_USER ? { user: c.SMTP_USER, pass: c.SMTP_PASSWORD } : undefined,
    },
  }),
  upload: { limits: { fileSize: 50_000_000 } },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: c.DATABASE_URL },
    // El esquema solo cambia por migraciones versionadas, igual en local y en Azure.
    push: false,
    migrationDir: path.resolve(dirname, "migraciones"),
    // En producción (Azure) la imagen aplica al arrancar las migraciones pendientes.
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    azureStorage({
      collections: { medios: true, documentos: true },
      allowContainerCreate: true,
      baseURL: c.AZURE_STORAGE_BASE_URL,
      connectionString: c.AZURE_STORAGE_CONNECTION_STRING,
      containerName: c.AZURE_STORAGE_CONTAINER,
    }),
  ],
});
