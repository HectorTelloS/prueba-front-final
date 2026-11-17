# 01 — Estructura y semántica HTML

## Objetivo
Construir una base accesible y semántica sobre la que se montan las distintas
funcionalidades. `index.html` no contiene datos: solo la estructura y los
contenedores que JavaScript rellena.

## Etiquetas utilizadas

| Etiqueta | Uso en la aplicación |
|---|---|
| `<header>` | Cabecera fija con marca, navegación y acciones. |
| `<nav>` | Acciones principales y paginación; incluyen `aria-label`. |
| `<main id="contenido-principal">` | Contenido principal, destino del `skip-link`. |
| `<section>` | Hero, categorías y resultados, cada una con `aria-labelledby`. |
| `<form role="search">` | Buscador; usa `novalidate` para aplicar validación propia. |
| `<fieldset>` / `<legend>` | Agrupan el filtro de orientación (radios ocultos visualmente). |
| `<article>` | Cada tarjeta de foto dentro de la galería. |
| `<figure>`-like (`.photo-card__media`) | Contenedor de imagen con texto alternativo y botón de acción. |
| `<footer>` | Pie de página con atribución a Pexels. |
| `<button>` | Todas las acciones (categorías, favoritos, paginación, modales). |
| `<dialog>`-like (`.modal__panel[role="dialog"]`) | Modales de favoritos y ajustes con `aria-modal="true"`. |
| `<div role="status">` | Los *toasts* para anunciar cambios al usuario. |

## Decisiones destacadas

- **Skip link**: primer elemento del `<body>`, visible al recibir el foco.
- **Textos alternativos**: cada imagen usa `photo.alt` devuelto por Pexels (o el
  título del catálogo de ejemplo) escapado con `UI.escapeHtml`.
- **Botones reales**: las tarjetas de categoría son `<button>`, por lo que son
  accesibles con teclado sin necesidad de `tabindex`.
- **Radios semánticos**: el filtro son `<input type="radio">`; las etiquetas
  `.chip` solo cambian su apariencia. `aria-label` describe cada acción.
- **Modales**: `role="dialog"`, `aria-modal`, cierre con `Escape`, con `data-close-modal`
  en el fondo y en la X, y devolución del foco al elemento anterior (`UI.openModal`).
- **Carga de scripts**: se usan scripts clásicos en orden de dependencia para que
  la aplicación también funcione abriendo `index.html` directamente (`file://`).

## Puntos de extensión
Si se quiere añadir una nueva sección, basta con crear un `<section>` con su
`aria-labelledby` y un contenedor con id; el controlador `PG.App` se encarga de
rellenarlo y de gestionar sus eventos.
