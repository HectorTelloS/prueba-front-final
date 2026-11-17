# 06 — Estilos y diseño responsive

## Metodología Mobile First

`styles.css` define primero la experiencia móvil y añade complejidad con media
queries `min-width`:

| Breakpoint | Cambios principales |
|---|---|
| Base (< 560px) | Una columna de categorías y una columna de fotos; buscador apilado. |
| ≥ 560px | Dos columnas; categorías y galería en 2 columnas. |
| ≥ 820px | Tres columnas; hero más amplio; modal más grande. |
| ≥ 1120px | Cuatro columnas de fotos; tarjetas de categoría más altas. |

La galería usa **CSS Columns** (`column-count` + `break-inside: avoid`), lo que
produce un efecto *masonry* sin JavaScript ni librerías.

## Design tokens

Colores, radios, sombras, transiciones y altura de cabecera se definen como
variables CSS en `:root`. Esto permite cambiar toda la paleta desde un único
sitio y mantiene consistencia visual.

Tema oscuro: el fondo oscuro hace que las fotografías destaquen, con acentos
violeta (`--accent`) y rosa (`--pink`) en acciones y gradientes.

## Detalles de interfaz

- **Esqueletos de carga**: degradado animado (*shimmer*) mientras llegan los datos.
- **Tarjetas**: elevación y zoom suave de la imagen al pasar el ratón.
- **Corazón**: relleno cuando está activo, contorno cuando no.
- **Toasts**: notificación temporal con icono y color según el tipo.
- **Modales**: fondo con desenfoque, animación de entrada y scroll contenido.
- **Accesibilidad**: `:focus-visible`, `skip-link`, `aria-*` y regla
  `@media (prefers-reduced-motion: reduce)` que desactiva animaciones.

## Compatibilidad

Se evitan sintaxis muy recientes en CSS/JS o se proporcionan alternativas:
- prefijos `-webkit-` para `backdrop-filter` y `background-clip`;
- la regex de búsqueda tiene una versión de respaldo sin propiedades Unicode;
- se usan `var()` y `clamp()` (soportados por los navegadores actuales de
  Chrome, Firefox, Opera y Safari).
