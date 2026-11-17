# 02 — Capa de datos y API de Pexels

## Archivos implicados
- `js/config.js` → constantes de conexión (`apiBase`, `requestTimeout`, `perPage`).
- `js/api.js` → capa de servicio (`PG.Api`).
- `js/demo-data.js` → catálogo de reserva (`PG.DemoData`).

## Endpoint utilizado

```
GET https://api.pexels.com/v1/search
    ?query=nature
    &orientation=portrait
    &page=1
    &per_page=9
    &locale=es-ES
```

Autenticación mediante la cabecera `Authorization: <API_KEY>`.

La API v1 de Pexels no expone un endpoint de categorías, así que las tres
categorías se traducen a términos de búsqueda (`nature`, `technology`, `people`)
definidos en `Config.CATEGORIES`. De este modo, pulsar una categoría realiza una
búsqueda real en Pexels.

## Flujo de una petición

1. `App.runSearch()` decide la query (texto del usuario o query de la categoría).
2. `Api.search(params)` comprueba si hay clave (`Api.hasApiKey()`).
3. Si hay clave → `Api.fetchLive(params)`:
   - construye la URL con `encodeURIComponent`,
   - usa `fetch` con `AbortController` y un tiempo máximo de 12 s,
   - controla códigos `401` (clave inválida) y `429` (límite de peticiones),
   - normaliza la respuesta a un modelo propio.
4. Si no hay clave o la petición falla → `Api.getDemo(params)`:
   - filtra por texto y orientación,
   - pagina los 36 ejemplos,
   - devuelve el mismo formato que la API real.

## Modelo normalizado

Todas las fotos, vengan de donde vengan, tienen esta forma:

```js
{
  id, alt, tags, photographer, photographerUrl, url,
  width, height, orientation,            // 'landscape' | 'portrait'
  src: { tiny, medium, large, original }
}
```

`normalizePhoto(raw)` es la única función que conoce la estructura de Pexels;
el resto de la aplicación trabaja siempre con el modelo normalizado. Esto
permite cambiar de proveedor (por ejemplo, a Unsplash) tocando únicamente
`api.js`.

## Modo demostración

Las URLs del catálogo apuntan al CDN público `images.pexels.com`, que no
requiere clave. Por eso la interfaz es completamente funcional (búsqueda,
filtros, paginación y favoritos) sin credenciales. Un distintivo en los
resultados indica si los datos son `● Pexels API` o `● Modo demostración`.

## Gestión de errores

- Clave inválida, límite excedido o red caída → aviso en la interfaz + datos de ejemplo.
- Imagen que no carga → se muestra el texto «Imagen no disponible» en la tarjeta.
- El controlador ignora respuestas de peticiones obsoletas mediante `requestId`,
  evitando que una búsqueda lenta sobrescriba otra más reciente.
