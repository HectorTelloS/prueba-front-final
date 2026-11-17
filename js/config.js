/**
 * @file config.js
 * @description Configuración centralizada de la aplicación: clave de API,
 * categorías, orientaciones, claves de LocalStorage y reglas de validación.
 *
 * Se expone como `PG.Config` (PG = Pexels Gallery) dentro de un IIFE para
 * evitar contaminar el ámbito global y mantener compatibilidad con file://.
 */

(function (global) {
  'use strict';

  /** @namespace PG */
  var PG = (global.PG = global.PG || {});

  /**
   * Clave de la API de Pexels por defecto.
   * Déjala vacía para usar el modo demostración (datos de ejemplo incluidos).
   * También puede introducirse desde el modal de configuración; en ese caso
   * se guarda en LocalStorage y tiene prioridad sobre este valor.
   *
   * @constant {string}
   */
  var DEFAULT_API_KEY = '';

  /**
   * Categorías mostradas en la página de inicio.
   * Cada categoría se traduce a un "query" que se envía a Pexels, ya que la
   * API v1 no dispone de un endpoint de categorías.
   *
   * @type {Array<{id: string, label: string, query: string, icon: string,
   *               description: string, gradient: string}>}
   */
  var CATEGORIES = [
    {
      id: 'naturaleza',
      label: 'Naturaleza',
      query: 'nature',
      icon: '🌿',
      description: 'Bosques, montañas y paisajes que respiran.',
      gradient: 'linear-gradient(135deg, #1f9d55, #0b6e4f 60%, #053f3a)'
    },
    {
      id: 'tecnologia',
      label: 'Tecnología',
      query: 'technology',
      icon: '💡',
      description: 'Código, hardware e ideas que nos conectan.',
      gradient: 'linear-gradient(135deg, #5b4bff, #2d2a8f 60%, #141442)'
    },
    {
      id: 'personas',
      label: 'Personas',
      query: 'people',
      icon: '✨',
      description: 'Retratos y rostros con historia propia.',
      gradient: 'linear-gradient(135deg, #ff6b9d, #c43d7e 60%, #6b1f52)'
    }
  ];

  /**
   * Opciones del filtro por orientación.
   * El valor vacío significa "sin filtro" (todas).
   *
   * @type {Array<{value: string, label: string}>}
   */
  var ORIENTATIONS = [
    { value: '', label: 'Todas' },
    { value: 'portrait', label: 'Verticales' },
    { value: 'landscape', label: 'Horizontales' }
  ];

  /**
   * Parámetros generales de la aplicación.
   *
   * @type {Object}
   */
  var SETTINGS = {
    /** @type {string} Endpoint base de la API de Pexels (v1). */
    apiBase: 'https://api.pexels.com/v1',
    /** @type {number} Fotos por página (9 = cuadrícula 3x3 en escritorio). */
    perPage: 9,
    /** @type {number} Longitud mínima permitida en la búsqueda. */
    minQueryLength: 2,
    /** @type {number} Longitud máxima permitida en la búsqueda. */
    maxQueryLength: 50,
    /** @type {number} Tiempo máximo de espera de una petición (ms). */
    requestTimeout: 12000,
    /** @type {Object} Claves usadas en el LocalStorage. */
    storageKeys: {
      favorites: 'pg_favorites_v1',
      apiKey: 'pg_api_key_v1'
    }
  };

  /**
   * Expresión regular de validación del campo de búsqueda.
   *
   * Exige que el texto empiece por una letra o número, continúe con letras,
   * números, espacios, guiones o apóstrofos y tenga entre 2 y 50 caracteres.
   * Se intenta la versión Unicode (\p{L}) para admitir acentos y alfabetos
   * internacionales; si el navegador no la soporta se usa una alternativa
   * clásica basada en rangos latinos.
   *
   * @type {RegExp}
   */
  var SEARCH_PATTERN;
  try {
    // eslint-disable-next-line no-useless-escape
    SEARCH_PATTERN = new RegExp("^[\\p{L}\\p{N}][\\p{L}\\p{N}\\s'-]{1,49}$", 'u');
  } catch (error) {
    SEARCH_PATTERN = /^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\s'-]{1,49}$/;
  }

  /**
   * Valida una cadena de búsqueda con la expresión regular definida.
   *
   * @param {string} value - Texto introducido por el usuario.
   * @returns {{valid: boolean, message: string}} Resultado y mensaje de error.
   */
  function validateQuery(value) {
    var text = String(value == null ? '' : value).trim();

    if (text.length === 0) {
      return { valid: false, message: 'Escribe una palabra clave para buscar.' };
    }
    if (text.length < SETTINGS.minQueryLength) {
      return { valid: false, message: 'Usa al menos ' + SETTINGS.minQueryLength + ' caracteres.' };
    }
    if (text.length > SETTINGS.maxQueryLength) {
      return { valid: false, message: 'Máximo ' + SETTINGS.maxQueryLength + ' caracteres.' };
    }
    if (!SEARCH_PATTERN.test(text)) {
      return { valid: false, message: 'Solo letras, números, espacios, guiones y apóstrofos.' };
    }
    return { valid: true, message: '' };
  }

  PG.Config = {
    DEFAULT_API_KEY: DEFAULT_API_KEY,
    CATEGORIES: CATEGORIES,
    ORIENTATIONS: ORIENTATIONS,
    SETTINGS: SETTINGS,
    SEARCH_PATTERN: SEARCH_PATTERN,
    validateQuery: validateQuery
  };
})(window);
