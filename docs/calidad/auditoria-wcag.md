# Auditoría de accesibilidad WCAG 2.2 AA

**Norma:** NORTIC A2:2023, capítulo 7 (accesibilidad), que adopta WCAG 2.2 nivel AA.

## 1. Pruebas automáticas (se ejecutan en cada cambio)

| Verificación | Cómo | Plantillas cubiertas |
| --- | --- | --- |
| Reglas WCAG 2.0, 2.1 y 2.2 A y AA | axe-core en Playwright (`tests/*.spec.ts`), en escritorio y móvil, también con alto contraste | Portada, Sobre nosotros, Servicios, ficha y solicitud de servicio, Noticias, Transparencia (inicio, sección y subsección), Contactos, Sugerencias, Preguntas frecuentes, Arrendatarios, Buscador, 404, catálogo de componentes |
| HTML válido, bien anidado y sin atributos duplicados (A2 7.01.d) | html-validate, preset `standard` (`tests/s7-calidad.spec.ts`) | Las mismas |
| Texto ampliado al 200 % sin desplazamiento horizontal (A2 7.01.u) | Playwright a 375 px con texto al 200 % | Los 9 apartados de A2 4.02 |
| Navegación por teclado sin trampas y foco visible (A2 7.01.e, j) | Recorrido con Tab de la portada; pausa del carrusel con teclado | Portada |
| Contraste (A2 7.01.i) | axe, en tema normal y de alto contraste | Todas las anteriores |
| Movimiento (WCAG 2.2.2) | Carrusel con pausa; sin movimiento con «reducir movimiento» del sistema | Portada |

## 2. Prueba con lector de pantalla (la hace una persona)

**Herramienta:** NVDA (gratuito) en Windows con Chrome o Firefox. Descarga: https://www.nvaccess.org/download/
**Quién:** una persona de TIC o Comunicaciones; mejor si es usuaria habitual de lector de pantalla.
**Tiempo:** unas 2 horas.

### Teclas básicas de NVDA

| Acción | Tecla |
| --- | --- |
| Leer todo desde el punto actual | NVDA + flecha abajo (NVDA = tecla Insert) |
| Siguiente encabezado | H |
| Siguiente zona (región, menú) | D |
| Lista de enlaces o encabezados | NVDA + F7 |
| Siguiente campo de formulario | F |
| Detener la voz | Ctrl |

### Recorrido a verificar (marcar ✓ o anotar el problema)

| # | Página | Qué comprobar | Resultado |
| --- | --- | --- | --- |
| 1 | Portada | Lo primero que se oye es «Saltar al contenido principal»; al activarlo, el foco va al contenido | |
| 2 | Portada | El carrusel se anuncia como «carrusel», cada diapositiva como «1 de 5», y el botón «Pausar el carrusel» funciona | |
| 3 | Portada | Con H se recorren los encabezados en orden lógico (Transparencia, Servicios, Publicaciones…) | |
| 4 | Menú principal | Con Tab y Enter se abre «Sobre nosotros» y se oye si está expandido o contraído | |
| 5 | Herramienta de accesibilidad | Aumentar el texto y activar el alto contraste se anuncian | |
| 6 | Transparencia › Presupuesto › Ejecución | El menú de transparencia se anuncia con sus secciones; los años y los documentos se leen con tipo, tamaño y fecha | |
| 7 | Servicios › No Objeción | Los datos de la ficha se leen como lista de términos y valores | |
| 8 | Contactos › Sugerencias | Cada campo anuncia su etiqueta y si es obligatorio; los errores se anuncian al enviar; el número de caso se lee al terminar | |
| 9 | Buscador | Escribir «nómina», enviar y oír el total de resultados | |
| 10 | Una noticia | Título, fecha, lugar y texto alternativo de la foto | |
| 11 | Página inexistente | Se anuncia «Página no encontrada» con las sugerencias | |

### Registro del resultado

| Fecha | Persona | Lector y navegador | Problemas encontrados | Corregidos en |
| --- | --- | --- | --- | --- |
| | | | | |

## 3. Auditoría externa

La auditoría WCAG externa y la prueba de penetración se contratan antes de producción (riesgo 14 de los requerimientos, proceso de compra bajo la Ley 47-25).
