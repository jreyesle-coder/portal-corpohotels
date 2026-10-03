// Genera favicon e íconos desde los SVG oficiales de public/brand (A2 2.01.a).
// Uso: npm run iconos  (ejecutar de nuevo al reemplazar los SVG del kit de marca)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const raiz = path.resolve(import.meta.dirname, "..");
const publico = path.join(raiz, "public");
const destino = path.join(publico, "iconos");
const icono = await readFile(path.join(publico, "brand", "icono-azul.png"));

await mkdir(destino, { recursive: true });

const png = (tamano, fondo) =>
  sharp(icono)
    .resize(tamano, tamano, { fit: "contain", background: fondo ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .flatten(fondo ? { background: fondo } : false)
    .png()
    .toBuffer();

// Favicon 16×16 (A2 2.01.a) más 32 y 48 dentro del mismo .ico.
const [p16, p32, p48] = await Promise.all([png(16), png(32), png(48)]);
await writeFile(path.join(publico, "favicon.ico"), await pngToIco([p16, p32, p48]));
await writeFile(path.join(destino, "favicon-16.png"), p16);

// Íconos de escritorio y móvil: 180 (Apple, fondo blanco), 192 y 512 (manifiesto).
const blanco = { r: 255, g: 255, b: 255, alpha: 1 };
await writeFile(path.join(destino, "apple-touch-icon.png"), await png(180, blanco));
await writeFile(path.join(destino, "icono-192.png"), await png(192, blanco));
await writeFile(path.join(destino, "icono-512.png"), await png(512, blanco));

// Bandera del identificador oficial: el SVG oficial pesa ~140 KB; a 12 px de alto basta un PNG 3x.
const bandera = await readFile(path.join(raiz, "scripts", "fuentes", "bandera-rd.svg"));
await sharp(bandera, { density: 300 })
  .resize(54, 36)
  .png()
  .toFile(path.join(publico, "sdd", "bandera-rd.png"));

console.log("Íconos generados en public/favicon.ico, public/iconos/ y public/sdd/bandera-rd.png");
