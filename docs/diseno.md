# Diseño

Parte de [propuesta_frontend.md](https://github.com/anvorja/api-crazy-drinks/blob/develop/docs/propuesta_frontend.md)
de la API. La idea: **un bar de noche que te conoce**. Es audaz en la tipografía y el
movimiento, y sobrio en el color y los detalles.

## Principios

1. **El ADN es la firma.** El radar de nueve sabores aparece en:
   - el logo (una copa cuyo líquido es un radar);
   - el coctel del día;
   - cada bebida;
   - el swipe, donde cambia en vivo con cada gesto;
   - la compatibilidad, con dos radares superpuestos.
2. **Tipografía editorial.** Titulares grandes en Space Grotesk y texto en Inter. Una sola
   palabra en degradado coral a ámbar por pantalla, como mucho.
3. **Diseñado primero para móvil, pero pensado también para escritorio.** Hay dos
   navegaciones:
   - en el teléfono, una barra inferior al alcance del pulgar;
   - en escritorio, la barra superior y el buscador con Ctrl K.
4. **Cada error lleva a una acción:**
   - la edad lleva a "Entrar" o "Ver sin alcohol";
   - el plan, a "Ver planes";
   - la sesión, a "Entrar" y volver a la misma pantalla.
5. **Consumo responsable.**
   - La verificación de edad es visible.
   - El modo Cocktle zero existe para quien no toma alcohol.
   - El pie dice "Disfruta con moderación".
6. **Accesibilidad.**
   - Contraste AA en los dos temas.
   - Foco visible y enlace "Saltar al contenido".
   - El radar tiene su descripción para lectores de pantalla y cada eje se enfoca con Tab.
   - El swipe se puede usar con botones y con teclado: ← paso, → me provoca, ↑ súper,
     Z deshacer.
   - Se respeta `prefers-reduced-motion`.

## Tokens

Definidos en `src/index.css`. shadcn/ui los usa a través de `--primary`, `--card` y demás.

| Token                           | Oscuro (predeterminado)  | Claro                                     |
| ------------------------------- | ------------------------ | ----------------------------------------- |
| `--background`                  | `#1b1036` (morado noche) | `#fff7ef` (crema)                         |
| `--card`                        | `#241545`                | `#ffffff`                                 |
| `--primary`                     | `#ff7a59` (coral)        | `#ff7a59`                                 |
| `--primary-foreground`          | `#1b1036`                | `#1b1036`                                 |
| `--highlight` (texto destacado) | `#ffb86b` (ámbar)        | `#b4461f` (coral quemado, AA sobre crema) |
| `--destructive`                 | `#ff4d6d`                | `#d62847`                                 |

- **Colores de marca:** `coral`, `amber`, `plum` y `night` (`bg-plum`, `text-amber`…).
- **Termómetro de Cocktle:** `heat-correct` 🟩, `heat-hot` 🟨, `heat-warm` 🟧, `heat-cold` 🟥.
- **Textura:** un grano de película sutil y dos brillos radiales en el fondo, para que el
  morado se sienta como la luz de un bar y no como una pantalla plana.
- **Botón coral:** siempre lleva texto tinta (`#1b1036`), con contraste de unos 7:1. El texto
  blanco sobre coral no llega a AA.

## Tema

- El interruptor de la barra superior cambia entre claro y oscuro.
- Se guarda en `localStorage` (`crazy-drinks.theme`) y se sincroniza entre pestañas.
- Un script en `index.html` aplica la clase antes del primer pintado, sin destello del tema
  equivocado.
- También actualiza `<meta name="theme-color">` para la barra del navegador en el móvil.

## Componentes propios

| Componente                  | Qué hace                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `LogoMark` / `Logo`         | Copa con radar y wordmark ("Crazy" inclinado en ámbar)                                                               |
| `DnaRadar`                  | Radar SVG de 9 ejes, animado. Admite una segunda serie punteada para comparar. Ejes enfocables que muestran su valor |
| `DrinkCard`                 | Foto responsive (200/350/500 px de Cloudinary), insignia de alcohol, categoría e ingredientes                        |
| `SwipeCard`                 | Arrastre con rotación, sellos "Me provoca" / "Paso" / "¡Súper!" y salida animada                                     |
| `SearchCommand`             | Buscador global (Ctrl K) que tolera errores ("margarta")                                                             |
| `ErrorState` / `EmptyState` | Estados con una acción siguiente                                                                                     |
| `SharePanel`                | Tarjeta PNG de la API, copiar enlace, Web Share, descargar                                                           |
| `CompatibilityResult`       | Porcentaje, rasgos en común, radares superpuestos y cocteles puente                                                  |

## Responsive

| Pantalla      | Móvil                                              | Escritorio                                   |
| ------------- | -------------------------------------------------- | -------------------------------------------- |
| Navegación    | Barra inferior de 5 pestañas y menú lateral        | Barra superior y buscador                    |
| Explorar      | 2 columnas, filtros en una hoja inferior           | 4 columnas, filtros en un panel lateral fijo |
| Descubrir     | Mazo a 50 % del alto visible, con botones visibles | Mazo y ADN en vivo lado a lado               |
| Mi ADN        | Radar debajo del titular                           | Titular y radar lado a lado                  |
| Carta del bar | Una tarjeta por coctel                             | Tabla con costo, precio y margen             |
