Tarea: Galería de Fotos con Pexels
Requisitos del Proyecto

Se desarrollará una Web App en la que se debe demostrar el dominio de los conceptos aprendidos hasta el momento. Se valorará la originalidad y la búsqueda de soluciones a todos los niveles, así como el uso de buenas prácticas.
Funcionalidades

    Página de inicio con categorías Al entrar en la app, se deben mostrar tres categorías de imágenes (pueden ser por temática, por ejemplo: Naturaleza, Tecnología, Personas). Al hacer clic en alguna de ellas, se deben mostrar todas las fotos asociadas a dicha categoría utilizando la API de Pexels.

    Buscador de imágenes Incluir un campo de búsqueda que permita buscar imágenes por palabras clave ingresadas por el usuario.

    Filtro por orientación Añadir un filtro para seleccionar la orientación de las imágenes: Todas, Verticales, Horizontales.

    Paginación Implementar paginación para poder navegar entre los resultados cuando haya muchas imágenes.

    Favoritos (añadir, mostrar, eliminar)
        Cada imagen debe tener un botón o ícono para añadirla a favoritos.
        Los favoritos se deben guardar en el LocalStorage del navegador.
        Debe haber una sección (página o modal) donde se muestren las imágenes guardadas como favoritas.
        Desde esa sección, el usuario podrá eliminar imágenes de sus favoritos.
        Las imágenes guardadas deben mantenerse persistentes incluso si el usuario cierra o recarga el navegador.

Tecnologías a Utilizar

    HTML
    CSS
    JavaScript

Requisitos Mínimos

    Web App que consuma datos de la API de www.pexels.com o de https://unsplash.com/developers.
    Crear un repositorio en GitHub con al menos dos ramas: main y develop.
    Uso correcto de etiquetas semánticas en HTML.
    Maquetación responsive utilizando la metodología Mobile First.
    Compatibilidad visual en los principales navegadores: Firefox, Opera, Chrome y Safari.
    Uso de fetch para realizar peticiones HTTP a la API.
    Uso de LocalStorage para guardar, mostrar y eliminar imágenes favoritas.
    Validación del campo de búsqueda usando expresiones regulares.

Documentación

Se deberá generar documentación de la app de cada parte. Además de comentar el código las partes importantes, se deberá hacer uso de JSDOC para agregar documentación a nuestro servidor.