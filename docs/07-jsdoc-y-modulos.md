# 07 — JSDoc y arquitectura de módulos

## Arquitectura

La aplicación sigue una separación clara de responsabilidades:

```
        eventos del usuario
                │
                ▼
        ┌───────────────┐
        │   PG.App      │  Controlador: estado + eventos
        └───┬───────┬───┘
            │       │
     ┌──────▼──┐  ┌──▼───────┐
     │ PG.Api  │  │PG.Storage│  Servicios (capa de datos)
     └────┬────┘  └──────────┘
          │
   ┌──────▼────────┐
   │ PG.DemoData   │  Reserva sin clave
   └───────────────┘
          │
     ┌────▼────┐
     │ PG.UI   │  Renderizado (recibe datos, devuelve HTML)
     └─────────┘
```

Cada archivo es un **IIFE** que recibe `window` y expone un único objeto en el
namespace `PG`. Ventajas:
- no hay variables globales sueltas;
- se puede cargar con `<script>` sin bundler;
- el orden de dependencias es explícito en `index.html`.

## JSDoc

Todos los módulos incluyen documentación JSDoc:

- `@file` y `@description` al inicio de cada archivo.
- `@namespace PG` para documentar el espacio de nombres.
- `@param {tipo} nombre` / `@returns {tipo}` en cada función pública.
- `@throws {Error}` en `Api.fetchLive`.
- `@type` y `@constant` para constantes y objetos de configuración.

La capa de servicios (`api.js` y `storage.js`) está documentada como si fuera
el «servidor» de la aplicación: expone operaciones bien definidas
(`search`, `add`, `remove`, …) que el controlador consume sin conocer los
detalles de HTTP ni de `localStorage`. Aunque el proyecto es 100 % cliente,
esa capa cumple el papel de backend lógico y por eso recibe la documentación
más detallada.

### Ejemplo

```js
/**
 * Añade una foto a favoritos. No permite duplicados.
 *
 * @param {Object} photo - Foto normalizada a guardar.
 * @returns {boolean} `true` si se añadió; `false` si ya existía o falló.
 */
function add(photo) { ... }
```

## Generar la documentación (opcional)

Si se quiere producir HTML a partir de los comentarios:

```bash
npx jsdoc js/*.js -d docs/api
```

El resultado se abre en `docs/api/index.html`.

## Buenas prácticas aplicadas

- Nombres descriptivos y constantes centralizadas.
- Funciones pequeñas y puras en `UI` y `Api`.
- Manejo explícito de errores y estados de carga/vacío.
- Eventos delegados para no volver a enlazar listeners tras cada render.
- Escape de HTML en todos los textos que provienen de la API.
