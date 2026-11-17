# Lumina — Galería de Fotos con Pexels

Aplicación web de galería fotográfica construida con **HTML, CSS y JavaScript puro**
(sin frameworks ni herramientas de compilación). Consume la API de **Pexels** y
ofrece búsqueda, filtros, paginación y favoritos persistentes.

> **Nota:** la aplicación funciona *sin clave de API* gracias a un catálogo de
> ejemplo de 36 fotografías reales del CDN de Pexels (modo demostración). Si se
> introduce una clave propia, la galería consulta la API en vivo automáticamente.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Página de inicio con categorías** | Tres categorías (Naturaleza, Tecnología y Personas) que lanzan una búsqueda en Pexels al pulsarlas. |
| **Buscador** | Campo con validación mediante expresión regular (entre 2 y 50 caracteres; letras con acentos, números, espacios, guiones y apóstrofos). |
| **Filtro por orientación** | Segmentación en *Todas / Verticales / Horizontales*; se aplica tanto a la API real como al modo demo. |
| **Paginación** | 9 imágenes por página con navegación anterior/siguiente, números y elipsis. |
| **Favoritos** | Añadir desde cualquier tarjeta, ver en un modal, eliminar uno por uno o vaciar la lista. Persisten en `localStorage`. |
| **Configuración opcional** | Modal para guardar/quitar la API Key de Pexels (también en `localStorage`). |
| **Estados y feedback** | Esqueletos de carga, estado vacío, avisos de modo demo/error y notificaciones *toast*. |
| **Accesibilidad** | Etiquetas semánticas, `skip-link`, `aria-*`, foco visible, cierre con `Escape` y soporte de `prefers-reduced-motion`. |

---

## 🚀 Puesta en marcha

### Opción A: abrir directamente
Abre `index.html` en cualquier navegador moderno. El modo demostración funciona
sin servidor.

### Opción B: servidor local (recomendado para la API en vivo)
```bash
python -m http.server 8000
# visitar http://localhost:8000
```

### Añadir tu clave de Pexels (opcional)
1. Crea una cuenta gratuita en <https://www.pexels.com/api/>.
2. En la app, pulsa el icono de **configuración** (engranaje) de la cabecera.
3. Pega tu clave y guarda. Se almacena en `localStorage` bajo `pg_api_key_v1`.

También puedes dejarla fija en `js/config.js` modificando `DEFAULT_API_KEY`.
Si la clave es inválida o hay un error de red, la app avisa y sigue mostrando
las fotos de ejemplo, por lo que nunca se queda sin contenido.

---

## 📁 Estructura del proyecto

```
prueba-front-final/
├── index.html              # Estructura semántica y plantilla de la UI
├── css/
│   └── styles.css          # Diseño Mobile First (tokens, layout, modales, toasts)
├── js/
│   ├── config.js           # Constantes, categorías, regex y validación (PG.Config)
│   ├── demo-data.js        # Catálogo de ejemplo de 36 fotos (PG.DemoData)
│   ├── api.js              # Peticiones fetch a Pexels + normalización (PG.Api)
│   ├── storage.js          # Persistencia de favoritos en LocalStorage (PG.Storage)
│   ├── ui.js               # Renderizado y utilidades de interfaz (PG.UI)
│   └── app.js              # Controlador/estado y eventos (PG.App)
├── docs/                   # Documentación técnica por módulos
└── README.md
```

Los scripts se cargan en orden desde `index.html` y cada uno expone un objeto en
el namespace `window.PG` mediante un **IIFE**. Así se evita contaminar el ámbito
global y se mantiene compatibilidad con `file://` (no se usan módulos ES).

---

## 🌿 Ramas de Git

- `main` — versión estable.
- `develop` — rama de desarrollo donde se integran los cambios.

```bash
git checkout develop
# ... realizar cambios ...
git add . && git commit -m "feat: nueva funcionalidad"
git checkout main && git merge develop
```

---

## 🌐 Compatibilidad

Chrome, Firefox, Opera y Safari (versiones actuales). Se utilizan características
estándar con alternativas cuando es necesario (por ejemplo, la regex de búsqueda
tiene *fallback* si el navegador no admite propiedades Unicode `\p{L}`).

---

## 📚 Documentación

- [Estructura y semántica HTML](docs/01-estructura-y-semantica.md)
- [Capa de datos y API de Pexels](docs/02-api-pexels.md)
- [Búsqueda y filtros (regex)](docs/03-busqueda-y-filtros.md)
- [Favoritos y LocalStorage](docs/04-favoritos-localstorage.md)
- [Paginación](docs/05-paginacion.md)
- [Estilos y diseño responsive](docs/06-estilos-responsive.md)
- [JSDoc y arquitectura de módulos](docs/07-jsdoc-y-modulos.md)

---

## 🧪 Comprobación rápida

1. Al entrar deben verse **3 categorías**.
2. Pulsar *Naturaleza* → 12 resultados, 2 páginas.
3. Escribir `a` en el buscador → mensaje de error de validación.
4. Escribir `bosque` → resultados filtrados y título actualizado.
5. Marcar *Verticales* → la cantidad de resultados disminuye.
6. Pulsar un corazón → el contador del header sube; recargar → el favorito sigue ahí.
7. Abrir *Favoritos* → eliminar la foto → el contador vuelve a 0.

---

*Proyecto de demostración — imágenes cortesía de [Pexels](https://www.pexels.com/).*
