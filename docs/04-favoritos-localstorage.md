# 04 — Favoritos y LocalStorage

## Requisitos cubiertos
- ✅ Añadir favorito desde cada foto (botón de corazón).
- ✅ Mostrar todos los favoritos en un modal.
- ✅ Eliminar un favorito desde el modal (y desde la propia galería).
- ✅ Vaciar toda la lista.
- ✅ Persistencia al cerrar o recargar el navegador.

## Clave de almacenamiento

```js
localStorage['pg_favorites_v1'] = JSON.stringify([ fotoNormalizada, ... ]);
```

Se guarda el objeto completo de la foto, no solo su id, para que el modal pueda
mostrar las imágenes sin depender de una petición a la API. Así los favoritos
también funcionan sin conexión.

## API del módulo `PG.Storage`

| Función | Descripción |
|---|---|
| `all()` | Devuelve la lista (array vacío si no hay nada o los datos están corruptos). |
| `isFavorite(id)` | Comprueba si un id está guardado. |
| `add(photo)` | Añade al principio; evita duplicados. |
| `remove(id)` | Elimina por id. |
| `toggle(photo)` | Añade o quita y devuelve el nuevo estado. |
| `count()` | Número de favoritos. |
| `clear()` | Vacía la lista. |

Todas las escrituras pasan por `write()`, que maneja errores de cuota o de
acceso a `localStorage` sin lanzar excepciones hacia la interfaz.

## Sincronización de vistas

Cada escritura emite un evento personalizado:

```js
document.dispatchEvent(new CustomEvent('pg:favoriteschange', {detail:{count}}));
```

`App` se suscribe a él y:
1. actualiza el `badge` del header;
2. sincroniza el estado (`aria-pressed`, clase `is-active`) de **todos** los
   botones de corazón visibles;
3. vuelve a pintar el modal de favoritos si está abierto.

Gracias a este patrón, quitar una foto del modal actualiza al instante su
corazón en la galería principal, y viceversa.

## Interacción

- El botón usa `aria-label="Añadir a favoritos"` / `Quitar de favoritos` según
  su estado y `aria-pressed`.
- Los eventos se delegan en `document`, por lo que funcionan tanto en la galería
  principal como en el modal sin volver a enlazar listeners tras cada render.
- El modal muestra un estado vacío con una llamada a la acción y oculta el
  pie de «Vaciar favoritos» cuando la lista está vacía.
