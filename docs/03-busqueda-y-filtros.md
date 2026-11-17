# 03 — Búsqueda, validación y filtros

## Validación con expresión regular

`Config.validateQuery(value)` aplica la siguiente regex:

```js
/^[\p{L}\p{N}][\p{L}\p{N}\s'-]{1,49}$/u
```

Reglas:
- Empieza por una letra o número.
- El resto puede contener letras (incluidos acentos y otros alfabetos), números,
  espacios, guiones y apóstrofos.
- Longitud total: entre 2 y 50 caracteres (coincide con `maxlength` del input).

Si el navegador no soporta las propiedades Unicode (`\p{L}`), `config.js` crea
la regex alternativa `/^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\s'-]{1,49}$/` dentro de un
`try/catch`. Esto garantiza compatibilidad con versiones antiguas de Safari.

La validación se ejecuta al enviar el formulario. Los errores se muestran en
`#searchError` (`role="alert"`) y se añade la clase `has-error` al campo.

## Búsqueda

- El texto se normaliza (`trim()`) y se envía como parámetro `query`.
- En modo demostración se comparan `alt`, etiquetas, fotógrafo y categoría.
- El título de resultados se actualiza: `Resultados para “bosque”`.
- Si la búsqueda procede de una categoría, el título muestra el nombre de la
  categoría y la query enviada es la de esa categoría.

## Filtro por orientación

Tres radios dentro de un `<fieldset>`:

| Valor | Significado | Parámetro de Pexels |
|---|---|---|
| `''` | Todas | (no se envía) |
| `portrait` | Verticales | `orientation=portrait` |
| `landscape` | Horizontales | `orientation=landscape` |

El evento `change` del grupo actualiza `state.orientation` y, si ya estamos en
la vista de resultados, vuelve a buscar desde la página 1. En modo demo el
filtro se aplica sobre el campo `orientation` calculado al crear cada foto.

## Estados combinados

Búsqueda y orientación se combinan de forma acumulativa: p. ej. `bosque` +
`Verticales` filtra por ambas condiciones. La paginación se reinicia siempre
que cambia uno de estos filtros para evitar caer en una página vacía.
