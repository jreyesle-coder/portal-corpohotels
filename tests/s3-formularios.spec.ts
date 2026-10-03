import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";
import pg from "pg";

/**
 * Criterio "Listo cuando" de S3: un ciudadano envía una sugerencia y recibe número de caso en
 * pantalla y por correo; los datos quedan cifrados en reposo. Además: ficha A5 de 15 campos,
 * formularios por pasos (A2 2.01.b.vi–xi), solo POST con protección de origen, encuesta (5.04.1).
 * Requiere Docker Compose (postgres, azurite, mailpit, entra-simulado) y `npm run sembrar`.
 */
const DB = "postgres://portal:portal_dev@localhost:5432/portal";
const MAILPIT = "http://localhost:8025";
const corrida = randomUUID().slice(0, 8);
const NOMBRE_PRUEBA = `Prueba automatizada ${corrida}`;

async function consultar<T>(sql: string, parametros: unknown[] = []): Promise<T[]> {
  const cliente = new pg.Client({ connectionString: DB });
  await cliente.connect();
  try {
    return (await cliente.query(sql, parametros)).rows as T[];
  } finally {
    await cliente.end();
  }
}

async function ir(page: Page, ruta: string) {
  await page.goto(ruta);
  await page.waitForLoadState("load");
  await page.addStyleTag({ content: "[data-aviso-cookies]{display:none!important}" });
}

async function llenarSugerencia(page: Page, correo: string) {
  await page.getByLabel(/Nombre completo/).fill(NOMBRE_PRUEBA);
  await page.getByLabel(/Correo electrónico/).fill(correo);
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel(/Tipo de comentario/).selectOption("sugerencia");
  await page.getByLabel(/^Comentario/).fill("Sugiero publicar el calendario de mantenimiento de los hoteles del Estado.");
  await page.getByRole("button", { name: "Siguiente" }).click();
}

test.describe("Ficha de servicio (A2 4.02.b, NORTIC A5)", () => {
  test("el servicio publicado muestra los campos de la ficha", async ({ page }) => {
    await ir(page, "/servicios/solicitud-de-no-objecion-para-obras");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solicitud de No Objeción para obras o intervenciones físicas");
    await expect(page.getByText("También conocido como:")).toBeVisible();
    const ficha = page.locator("[data-ficha-servicio]");
    for (const titulo of ["Descripción del servicio", "Requisitos", "Procedimiento"]) {
      await expect(ficha.getByRole("heading", { name: titulo, level: 2 })).toBeVisible();
    }
    for (const dato of [
      "A quién va dirigido",
      "Área responsable",
      "Contacto del área",
      "Horario de prestación",
      "Costo",
      "Tiempo de respuesta a la solicitud",
      "Tiempo de realización",
      "Canales de prestación",
      "Acceso al servicio",
    ]) {
      await expect(ficha.locator("dt", { hasText: dato }).first()).toBeVisible();
    }
    await expect(ficha.locator("ol > li")).not.toHaveCount(0);
    const boton = page.getByRole("link", { name: /^Solicitar en línea/ });
    await expect(boton).toHaveAttribute("href", "https://noobjecion-corphotels.vercel.app/");
    await expect(boton).toHaveAttribute("target", "_blank");
  });

  test("un servicio con ficha incompleta muestra solo lo disponible y queda marcado en el CMS", async ({ page }) => {
    await ir(page, "/servicios/actualizacion-de-datos");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Actualización de datos");
    const ficha = page.locator("[data-ficha-servicio]");
    await expect(ficha.getByRole("heading", { name: "Descripción del servicio" })).toBeVisible();
    // No se muestran rótulos vacíos.
    await expect(ficha.locator("dt", { hasText: "Costo" })).toHaveCount(0);
    const [fila] = await consultar<{ ficha_completa: boolean; campos_pendientes: string }>(
      "SELECT ficha_completa, campos_pendientes FROM servicios WHERE slug = 'actualizacion-de-datos'",
    );
    expect(fila.ficha_completa).toBe(false);
    expect(fila.campos_pendientes).toContain("Área responsable");
  });
});

test.describe("Quejas y sugerencias (A2 2.01.b.vi–ix, 2.01.b.xi)", () => {
  test("un ciudadano envía una sugerencia y recibe número de caso en pantalla y por correo", async ({ page }) => {
    const correo = `ciudadano.${corrida}@prueba.example`;
    await ir(page, "/contactos/sugerencias");

    // Guía de uso al inicio e indicador de etapa.
    await expect(page.getByRole("complementary", { name: "Antes de empezar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paso 1 de 3: Sus datos" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Progreso del formulario" }).locator("[aria-current=step]")).toHaveText(/1\. Sus datos/);

    // Validación previa con errores escritos y foco en el primer campo con error.
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.locator("[data-formulario] [role=alert]")).toContainText("Complete el campo «Nombre completo».");
    await expect(page.getByLabel(/Nombre completo/)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(/Nombre completo/)).toBeFocused();
    await page.getByLabel(/Correo electrónico/).fill("correo-invalido");
    await page.getByLabel(/Nombre completo/).fill(NOMBRE_PRUEBA);
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("Escriba un correo con el formato nombre@dominio.com.").first()).toBeVisible();

    // Campo opcional marcado y límite de caracteres.
    await expect(page.locator("label[for=campo-telefono]")).toContainText("(opcional)");
    await expect(page.getByLabel(/Nombre completo/)).toHaveAttribute("maxlength", "120");

    await page.getByLabel(/Correo electrónico/).fill(correo);
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByRole("heading", { name: "Paso 2 de 3: Su comentario" })).toBeVisible();
    await expect(page.getByLabel(/^Comentario/)).toHaveAttribute("maxlength", "2000");
    await page.getByLabel(/Tipo de comentario/).selectOption("sugerencia");
    await page.getByLabel(/^Comentario/).fill("Sugiero publicar el calendario de mantenimiento de los hoteles del Estado.");
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Revisión y consentimiento obligatorio.
    await expect(page.getByRole("heading", { name: "Paso 3 de 3: Revisar y enviar" })).toBeVisible();
    await expect(page.getByLabel("Datos que va a enviar")).toContainText(correo);
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(page.getByText("Debe aceptar el uso de sus datos").first()).toBeVisible();
    await page.getByLabel(/Autorizo a CORPHOTELS/).check();
    await page.getByRole("button", { name: "Enviar", exact: true }).click();

    // Confirmación inmediata con número de caso, tiempo, vías y privacidad.
    const confirmacion = page.locator("[data-confirmacion]");
    await expect(confirmacion.getByRole("heading", { name: "Recibimos su comentario" })).toBeVisible();
    const numero = (await confirmacion.locator("[data-numero-caso]").innerText()).trim();
    expect(numero).toMatch(/^CPH-\d{4}-\d{6}$/);
    await expect(confirmacion.getByText("Tiempo de respuesta")).toBeVisible();
    await expect(confirmacion.getByText(correo)).toBeVisible();
    await expect(confirmacion.getByRole("link", { name: "Política de privacidad" })).toBeVisible();
    await expect(confirmacion.getByText("Ya le enviamos un correo")).toBeVisible();

    // Correo con el número de caso (Mailpit = Communication Services en local).
    await expect
      .poll(async () => {
        const r = await (await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(numero)}`)).json();
        return (r.messages as { To: { Address: string }[]; Subject: string }[]).some(
          (m) => m.To.some((t) => t.Address === correo) && m.Subject.includes(numero),
        );
      })
      .toBe(true);

    // Datos cifrados en reposo: la base de datos no contiene el correo ni el nombre en claro.
    const [fila] = await consultar<{ correo: string; nombre: string; mensaje: string }>(
      "SELECT correo, nombre, mensaje FROM casos WHERE numero = $1",
      [numero],
    );
    expect(fila.correo.startsWith("v1:")).toBe(true);
    expect(fila.correo).not.toContain(correo);
    expect(fila.nombre).not.toContain("Prueba");
    expect(fila.mensaje).not.toContain("calendario");

    // La bitácora identifica el caso por su número, sin datos personales.
    const bitacora = await consultar<{ titulo: string }>("SELECT titulo FROM bitacora WHERE coleccion = 'casos' AND titulo = $1", [numero]);
    expect(bitacora.length).toBeGreaterThan(0);

    // Encuesta de satisfacción al finalizar (A2 5.04.1).
    await confirmacion.getByLabel("4").check();
    await confirmacion.getByLabel("Sí").check();
    await confirmacion.getByLabel(/Comentario/).fill(`prueba automatizada ${corrida}`);
    await confirmacion.getByRole("button", { name: "Enviar encuesta" }).click();
    await expect(page.getByText("Gracias por su opinión")).toBeVisible();
  });

  test("el formulario se envía por POST y se puede cancelar (A2 5.05.e, 7.01.x)", async ({ page }) => {
    await ir(page, "/contactos/sugerencias");
    await expect(page.locator("form[data-formulario], [data-formulario] form").first()).toHaveAttribute("method", /post/i);
    await page.getByRole("link", { name: "Cancelar" }).click();
    await expect(page).toHaveURL(/\/contactos$/);
  });

  test("se rechaza un envío con el origen de otro sitio (CSRF)", async ({ page, request }) => {
    // Se captura el envío real del formulario y se reproduce fuera del navegador con otro origen
    // (el navegador no permite falsificar la cabecera Origin).
    let capturado: { headers: Record<string, string>; body: Buffer } | undefined;
    await page.route("**/contactos/sugerencias", async (ruta) => {
      if (ruta.request().method() !== "POST") return ruta.continue();
      capturado = { headers: ruta.request().headers(), body: ruta.request().postDataBuffer()! };
      await ruta.abort();
    });
    await ir(page, "/contactos/sugerencias");
    await llenarSugerencia(page, `csrf.${corrida}@prueba.example`);
    await page.getByLabel(/Autorizo a CORPHOTELS/).check();
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect.poll(() => capturado).toBeTruthy();
    expect(capturado!.headers["next-action"]).toBeTruthy();

    const respuesta = await request.post("/contactos/sugerencias", {
      headers: { ...capturado!.headers, origin: "https://sitio-malicioso.example" },
      data: capturado!.body,
    });
    expect(respuesta.status()).toBeGreaterThanOrEqual(400);
    expect(await respuesta.text()).not.toMatch(/CPH-\d{4}-\d{6}/);
  });
});

test.describe("Accesibilidad de los formularios (WCAG 2.2 AA)", () => {
  test("pasos, errores y confirmación sin violaciones axe", async ({ page }) => {
    const axe = () => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).exclude("iframe");
    await ir(page, "/contactos/sugerencias");
    expect((await axe().analyze()).violations.map((v) => v.id)).toEqual([]);
    await page.getByRole("button", { name: "Siguiente" }).click();
    expect((await axe().analyze()).violations.map((v) => v.id)).toEqual([]);
    await llenarSugerencia(page, `axe.${corrida}@prueba.example`);
    expect((await axe().analyze()).violations.map((v) => v.id)).toEqual([]);
    await page.getByLabel(/Autorizo a CORPHOTELS/).check();
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(page.locator("[data-confirmacion]")).toBeVisible();
    expect((await axe().analyze()).violations.map((v) => v.id)).toEqual([]);
  });

  test("Contactos incluye el formulario de contacto", async ({ page }) => {
    await ir(page, "/contactos");
    await expect(page.getByRole("heading", { name: "Escríbanos" })).toBeVisible();
    await expect(page.locator("[data-formulario=contacto]")).toBeVisible();
  });
});

test.describe("Solicitud de servicio en línea (A2 2.01.b.x)", () => {
  test("un servicio con solicitud en línea entrega número de caso y tiempo de entrega", async ({ browser, baseURL }) => {
    // Un publicador crea y publica un servicio de prueba con la ficha A5 completa.
    const contexto = await browser.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL! } });
    const panel = await contexto.newPage();
    await panel.goto("/auth/entra/iniciar?destino=/gestion");
    await panel.getByPlaceholder("Enter any user/subject").fill(`oid-pub-s3-${corrida}`);
    await panel.locator("textarea[name=claims]").fill(
      JSON.stringify({ oid: `oid-pub-s3-${corrida}`, email: `pub.s3.${corrida}@corphotels.gob.do`, name: "Publicador S3", roles: ["Publicador"], amr: ["pwd", "mfa"] }),
    );
    await panel.getByRole("button", { name: "Sign-in" }).click();
    await panel.waitForURL((u) => u.pathname.startsWith("/gestion"));
    const parrafo = (texto: string) => ({
      root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: [
        { type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0,
          children: [{ type: "text", text: texto, format: 0, style: "", mode: "normal", detail: 0, version: 1 }] },
      ] },
    });
    const creado = await panel.request.post("/api/servicios", {
      data: {
        nombre: `Servicio de prueba ${corrida}`,
        resumen: "Servicio creado por las pruebas automáticas.",
        contenido: parrafo("Descripción del servicio de prueba."),
        dirigidoA: "Ciudadanía en general.",
        areaResponsable: "División de Tecnologías de la Información y Comunicación",
        contactoArea: { telefono: "(809) 688-3417", correo: "info@corphotels.gob.do" },
        requisitos: [{ texto: "Cédula de identidad." }],
        procedimiento: [{ texto: "Complete el formulario en línea." }],
        horario: "Lunes a viernes, de 8:00 a. m. a 3:00 p. m.",
        costo: "Gratuito.",
        tiempoRespuesta: "3 días laborables",
        tiempoRealizacion: "5 días laborables",
        canales: ["en-linea"],
        acceso: { solicitudEnLinea: true },
        _status: "published",
      },
    });
    expect(creado.status(), await creado.text()).toBe(201);
    const servicio = (await creado.json()).doc;

    const page = await browser.newPage({ baseURL });
    await page.goto(`/servicios/${servicio.slug}`);
    await page.getByRole("link", { name: "Solicitar en línea" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/servicios/${servicio.slug}/solicitud$`));
    await expect(page.getByRole("heading", { name: "Paso 1 de 3: Sus datos" })).toBeVisible();
    await page.getByLabel(/Nombre completo/).fill(NOMBRE_PRUEBA);
    await page.getByLabel(/Cédula de identidad/).fill("123");
    await page.getByLabel(/Correo electrónico/).fill(`solicitud.${corrida}@prueba.example`);
    await page.getByLabel(/^Teléfono/).fill("809-555-1234");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("Escriba la cédula con el formato 000-0000000-0.").first()).toBeVisible();
    await page.getByLabel(/Cédula de identidad/).fill("001-0000000-1");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByLabel(/Detalle de la solicitud/).fill("Solicitud de prueba automatizada.");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByLabel(/Autorizo a CORPHOTELS/).check();
    await page.getByRole("button", { name: "Enviar", exact: true }).click();

    const confirmacion = page.locator("[data-confirmacion]");
    await expect(confirmacion.getByRole("heading", { name: "Recibimos su solicitud" })).toBeVisible();
    await expect(confirmacion.locator("[data-numero-caso]")).toHaveText(/^CPH-\d{4}-\d{6}$/);
    await expect(confirmacion.getByText("Tiempo de entrega del resultado")).toBeVisible();
    await expect(confirmacion.getByText("3 días laborables")).toBeVisible();
    const numero = (await confirmacion.locator("[data-numero-caso]").innerText()).trim();
    const [caso] = await consultar<{ cedula: string; servicio_id: number }>("SELECT cedula, servicio_id FROM casos WHERE numero = $1", [numero]);
    expect(caso.cedula.startsWith("v1:")).toBe(true);
    expect(caso.servicio_id).toBe(servicio.id);

    // Limpieza: el publicador elimina el servicio de prueba.
    expect((await panel.request.delete(`/api/servicios/${servicio.id}`)).status()).toBe(200);
    await page.close();
    await contexto.close();
  });
});
