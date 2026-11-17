/**
 * @file demo-data.js
 * @description Catálogo de fotografías de ejemplo utilizado cuando no hay
 * clave de API (modo demostración) o cuando la petición a Pexels falla.
 * Las URLs apuntan al CDN público de imágenes de Pexels, por lo que la
 * galería es completamente funcional sin credenciales ni conexión a la API.
 *
 * Se expone como `PG.DemoData`.
 */

(function (global) {
  'use strict';

  var PG = (global.PG = global.PG || {});

  /** Palabras clave por categoría para que el buscador funcione también en demo. */
  var TAGS = {
    naturaleza: 'naturaleza nature',
    tecnologia: 'tecnologia tecnología technology tech',
    personas: 'personas persona people'
  };

  /**
   * Fábrica de fotografías de ejemplo con forma idéntica a las que devuelve
   * la API de Pexels (objeto normalizado).
   *
   * @param {number} id - Identificador de la foto en Pexels.
   * @param {string} category - Categoría interna (`naturaleza`, ...).
   * @param {string} alt - Texto alternativo / título de la imagen.
   * @param {string} photographer - Nombre del autor.
   * @param {number} width - Ancho declarado de la imagen.
   * @param {number} height - Alto declarado de la imagen.
   * @returns {Object} Foto normalizada con las distintas variantes de `src`.
   */
  function make(id, category, alt, photographer, width, height) {
    var base = 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg';
    return {
      id: id,
      category: category,
      alt: alt,
      tags: TAGS[category] || '',
      photographer: photographer,
      photographerUrl: 'https://www.pexels.com/',
      url: 'https://www.pexels.com/photo/' + id + '/',
      width: width,
      height: height,
      orientation: width > height ? 'landscape' : 'portrait',
      src: {
        tiny: base + '?auto=compress&cs=tinysrgb&w=200',
        medium: base + '?auto=compress&cs=tinysrgb&w=640',
        large: base + '?auto=compress&cs=tinysrgb&w=1100',
        original: base
      }
    };
  }

  /* Dimensión alternada para tener una mezcla de fotos verticales y horizontales. */
  var L = [1200, 800]; // landscape
  var P = [800, 1200]; // portrait

  /** @type {Array<Object>} Todas las fotos de demostración (36 en total). */
  var photos = [
    /* ----------------------------- Naturaleza ----------------------------- */
    make(1005417, 'naturaleza', 'Sendero de bosque entre árboles altos', 'Pixabay', L[0], L[1]),
    make(167964, 'naturaleza', 'Frondoso bosque verde', 'Kevin P', P[0], P[1]),
    make(325185, 'naturaleza', 'Montañas coronadas de nieve', 'Pixabay', L[0], L[1]),
    make(417164, 'naturaleza', 'Paisaje natural exuberante', 'Pixabay', P[0], P[1]),
    make(144903, 'naturaleza', 'Flores silvestres en primavera', 'Pixabay', L[0], L[1]),
    make(1591447, 'naturaleza', 'Lago rodeado de montañas', 'Pixabay', P[0], P[1]),
    make(2422084, 'naturaleza', 'Cascada escondida en la selva', 'Pixabay', L[0], L[1]),
    make(1446089, 'naturaleza', 'Playa tropical de arena blanca', 'Pixabay', P[0], P[1]),
    make(458805, 'naturaleza', 'Atardecer dorado sobre el campo', 'Pixabay', L[0], L[1]),
    make(503758, 'naturaleza', 'Bosque cubierto de nieve', 'Pixabay', P[0], P[1]),
    make(247599, 'naturaleza', 'Dunas de arena al amanecer', 'Pixabay', L[0], L[1]),
    make(1369327, 'naturaleza', 'Aurora boreal en el cielo nocturno', 'Pixabay', P[0], P[1]),

    /* ----------------------------- Tecnología ----------------------------- */
    make(3861969, 'tecnologia', 'Laptop con código en la pantalla', 'ThisIsEngineering', L[0], L[1]),
    make(1181365, 'tecnologia', 'Servidores en un centro de datos', 'Tima Miroshnichenko', P[0], P[1]),
    make(373543, 'tecnologia', 'Placa de circuitos electrónicos', 'Pixabay', L[0], L[1]),
    make(1591060, 'tecnologia', 'Teléfono inteligente sobre la mesa', 'Pixabay', P[0], P[1]),
    make(2079232, 'tecnologia', 'Gafas de realidad virtual', 'Pixabay', L[0], L[1]),
    make(3950340, 'tecnologia', 'Brazos robóticos industriales', 'Pixabay', P[0], P[1]),
    make(256706, 'tecnologia', 'Teclado mecánico de computadora', 'Pixabay', L[0], L[1]),
    make(718483, 'tecnologia', 'Cámara fotográfica profesional', 'Pixabay', P[0], P[1]),
    make(2770798, 'tecnologia', 'Pantallas de computadora modernas', 'Pixabay', L[0], L[1]),
    make(1639537, 'tecnologia', 'Drones de última generación', 'Pixabay', P[0], P[1]),
    make(261102, 'tecnologia', 'Tablet y accesorios digitales', 'Pixabay', L[0], L[1]),
    make(1116679, 'tecnologia', 'Estación de trabajo creativa', 'Pixabay', P[0], P[1]),

    /* ------------------------------ Personas ------------------------------ */
    make(220453, 'personas', 'Retrato de hombre sonriendo', 'Christin W', L[0], L[1]),
    make(774909, 'personas', 'Retrato de mujer joven', 'Christopher Campbell', P[0], P[1]),
    make(415829, 'personas', 'Mujer con expresión alegre', 'fauxels', L[0], L[1]),
    make(1239291, 'personas', 'Retrato profesional de mujer', 'Christin W', P[0], P[1]),
    make(733872, 'personas', 'Mujer sonriendo al aire libre', 'fauxels', L[0], L[1]),
    make(762020, 'personas', 'Retrato dulce de una niña', 'Pixabay', P[0], P[1]),
    make(1181686, 'personas', 'Hombre con gafas y mirada seria', 'fauxels', L[0], L[1]),
    make(2379004, 'personas', 'Retrato de hombre joven', 'fauxels', P[0], P[1]),
    make(614810, 'personas', 'Grupo de amigos compartiendo', 'fauxels', L[0], L[1]),
    make(1043471, 'personas', 'Mujer pensativa junto a la ventana', 'Engin Akyurt', P[0], P[1]),
    make(91227, 'personas', 'Retrato infantil lleno de curiosidad', 'Pixabay', L[0], L[1]),
    make(3760854, 'personas', 'Persona practicando deporte', 'fauxels', P[0], P[1])
  ];

  PG.DemoData = {
    photos: photos,
    make: make
  };
})(window);
