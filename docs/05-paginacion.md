# 05 — Paginación

## Parámetros

- `perPage = 9` (definido en `Config.SETTINGS`). En escritorio coincide con una
  cuadrícula de 3 × 3; en móvil se adapta a una columna.
- `page` empieza en 1 (Pexels también usa paginación base 1).
- `totalResults` procede de `data.total_results` (API) o del array filtrado
  (modo demo).

## Cálculo

```js
totalPages = Math.ceil(totalResults / perPage);
```

El resultado de la página se calcula en el servidor (API) o con `Array.slice`
en modo demostración:

```js
var start = (page - 1) * perPage;
list.slice(start, start + perPage);
```

## Interfaz

`UI.renderPagination()` genera:

- Botón `‹` (anterior), desactivado en la página 1.
- Numeración con elipsis para rangos largos ( máximo 7 entradas visibles ).
- Botón `›` (siguiente), desactivado en la última página.
- `aria-current="page"` en la página activa y `aria-label` en los botones.

La navegación se oculta automáticamente cuando solo hay una página.

## Reinicios

La página vuelve a 1 cuando:
- se envía una nueva búsqueda;
- se pulsa una categoría;
- cambia la orientación;
- se guarda o quita la clave de API.

## Protección contra carreras

`state.requestId` se incrementa en cada búsqueda. Cuando llega una respuesta,
el controlador compara su identificador con el actual; si no coinciden, la
descarta. Así, navegar rápido entre páginas no muestra resultados obsoletos.
