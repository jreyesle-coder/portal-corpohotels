import { randomUUID } from "node:crypto";
import { type Browser, type Page, test } from "@playwright/test";

/** Utilidades compartidas por las pruebas del CMS (sesión con el simulador de Entra ID y archivos). */

export const corrida = randomUUID().slice(0, 8);
export type Perfil = { roles: string[]; mfa?: boolean };

export async function iniciarSesion(page: Page, nombre: string, { roles, mfa = true }: Perfil) {
  await page.goto("/auth/entra/iniciar?destino=/gestion");
  const oid = `oid-${nombre}-${corrida}`;
  await page.getByPlaceholder("Enter any user/subject").fill(oid);
  await page.locator("textarea[name=claims]").fill(
    JSON.stringify({
      oid,
      email: `${nombre}.${corrida}@corphotels.gob.do`,
      name: `${nombre} ${corrida}`,
      roles,
      amr: mfa ? ["pwd", "mfa"] : ["pwd"],
    }),
  );
  await page.getByRole("button", { name: "Sign-in" }).click();
  await page.waitForURL((u) => !u.href.includes("/entra/authorize") && !u.pathname.startsWith("/auth/"));
}

export async function sesion(browser: Browser, nombre: string, perfil: Perfil) {
  // Como un navegador real en el propio sitio: las peticiones a la API llevan el origen del portal.
  const baseURL = test.info().project.use.baseURL!;
  const contexto = await browser.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL } });
  const page = await contexto.newPage();
  await iniciarSesion(page, nombre, perfil);
  return { page, api: page.request, cerrar: () => contexto.close() };
}

/** Peticiones con cookie de sesión: Payload exige el origen del propio sitio (protección CSRF). */
export const origen = (baseURL: string) => ({ Origin: baseURL });

export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
/** PDF válido de una página, con tabla de referencias cruzada correcta (Payload valida su integridad). */
export function pdfValido(): Buffer {
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>",
  ];
  let cuerpo = "%PDF-1.4\n";
  const posiciones: number[] = [];
  objetos.forEach((o, i) => {
    posiciones.push(Buffer.byteLength(cuerpo));
    cuerpo += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(cuerpo);
  cuerpo += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  cuerpo += posiciones.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("");
  cuerpo += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(cuerpo);
}
export const PDF_MINIMO = pdfValido();
export const contenido = (texto: string) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        textFormat: 0,
        children: [{ type: "text", text: texto, format: 0, style: "", mode: "normal", detail: 0, version: 1 }],
      },
    ],
  },
});
