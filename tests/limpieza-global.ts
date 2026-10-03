import { execSync } from "node:child_process";

/** Al terminar la suite, elimina del CMS el contenido creado por las pruebas. */
export default function limpiar() {
  execSync("npm run limpiar-pruebas", { stdio: "inherit" });
}
