/**
 * @file api.js
 * @description Capa de servicio de datos ("servidor" del lado cliente).
 * Encapsula todas las peticiones HTTP a la API de Pexels mediante `fetch`,
 * la normalización de las respuestas y el fallback al catálogo de ejemplo.
 *
 * Expuesto como `PG.Api`.
 */

(function (global) {
  'use strict';

  var PG = (global.PG = global.PG || {});
  var Config = PG.Config;
  var DemoData = PG.DemoData;

  /**
   * Obtiene la clave de API guardada por el usuario, o la clave por defecto.
   *
   * @returns {string} Clave de Pexels (cadena vacía si no hay ninguna).
   */
  function getApiKey() {
    try {
      var stored = global.localStorage.getItem(Config.SETTINGS.storageKeys.apiKey);
      return (stored || Config.DEFAULT_API_KEY || '').trim();
    } catch (error) {
      return (Config.DEFAULT_API_KEY || '').trim();
    }
  }

  /**
   * Guarda (o elimina) la clave de API en LocalStorage.
   *
   * @param {string} key - Clave a guardar. Una cadena vacía la elimina.
   * @returns {boolean} `true` si se pudo guardar correctamente.
   */
  function setApiKey(key) {
    try {
      var clean = String(key || '').trim();
      if (clean) {
        global.localStorage.setItem(Config.SETTINGS.storageKeys.apiKey, clean);
      } else {
        global.localStorage.removeItem(Config.SETTINGS.storageKeys.apiKey);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Indica si hay una clave de API disponible.
   *
   * @returns {boolean} `true` cuando se puede intentar una petición real.
   */
  function hasApiKey() {
    return getApiKey().length > 0;
  }

  /**
   * Convierte una foto cruda de Pexels a la forma canónica usada por la UI.
   * Trabajar con un único modelo evita acoplar las vistas a la API.
   *
   * @param {Object} raw - Foto tal como la devuelve Pexels.
   * @returns {Object} Foto normalizada.
   */
  function normalizePhoto(raw) {
    var photo = raw || {};
    var src = photo.src || {};
    var width = Number(photo.width) || 0;
    var height = Number(photo.height) || 0;

    return {
      id: photo.id,
      alt: photo.alt || 'Fotografía de Pexels',
      tags: photo.tags || '',
      photographer: photo.photographer || 'Autor desconocido',
      photographerUrl: photo.photographer_url || '',
      url: photo.url || '',
      width: width,
      height: height,
      orientation: photo.orientation || (width > height ? 'landscape' : 'portrait'),
      src: {
        tiny: src.tiny || src.medium || '',
        medium: src.medium || src.large || '',
        large: src.large || src.original || '',
        original: src.original || src.large || ''
      }
    };
  }

  /**
   * Construye la URL del endpoint de búsqueda de Pexels.
   *
   * @param {Object} params - Parámetros de la consulta.
   * @param {string} params.query - Palabras clave.
   * @param {string} [params.orientation] - `portrait`, `landscape` o `''`.
   * @param {number} params.page - Número de página (base 1).
   * @param {number} params.perPage - Resultados por página.
   * @returns {string} URL completa con querystring codificada.
   */
  function buildLiveUrl(params) {
    var query = params.query || 'nature';
    var url = Config.SETTINGS.apiBase + '/search?query=' + encodeURIComponent(query) +
      '&page=' + encodeURIComponent(params.page) +
      '&per_page=' + encodeURIComponent(params.perPage) +
      '&locale=es-ES';

    if (params.orientation) {
      url += '&orientation=' + encodeURIComponent(params.orientation);
    }
    return url;
  }

  /**
   * Realiza un `fetch` con un tiempo de espera máximo usando AbortController.
   *
   * @param {string} url - URL a solicitar.
   * @param {Object} options - Opciones de `fetch` (headers, method, ...).
   * @param {number} timeout - Milisegundos antes de abortar.
   * @returns {Promise<Response>} Respuesta HTTP.
   */
  function fetchWithTimeout(url, options, timeout) {
    var controller = new global.AbortController();
    var timer = global.setTimeout(function () {
      controller.abort();
    }, timeout);

    return global.fetch(url, Object.assign({}, options, { signal: controller.signal }))
      .then(function (response) {
        global.clearTimeout(timer);
        return response;
      }, function (error) {
        global.clearTimeout(timer);
        throw error;
      });
  }

  /**
   * Consulta la API real de Pexels.
   *
   * @param {Object} params - Parámetros de búsqueda.
   * @returns {Promise<Object>} Resultado normalizado con origen `live`.
   * @throws {Error} Si la clave es inválida, hay error HTTP o falla la red.
   */
  function fetchLive(params) {
    var url = buildLiveUrl(params);

    return fetchWithTimeout(url, {
      headers: { Authorization: getApiKey() }
    }, Config.SETTINGS.requestTimeout).then(function (response) {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('La clave de Pexels no es válida o ha caducado.');
        }
        if (response.status === 429) {
          throw new Error('Se superó el límite de peticiones de la API.');
        }
        throw new Error('Error ' + response.status + ' al consultar Pexels.');
      }
      return response.json();
    }).then(function (data) {
      var list = data.photos || [];
      return {
        photos: list.map(normalizePhoto),
        totalResults: Number(data.total_results) || list.length,
        page: Number(data.page) || params.page,
        perPage: params.perPage,
        source: 'live',
        warning: ''
      };
    });
  }

  /**
   * Filtra y pagina el catálogo de ejemplo.
   *
   * @param {Object} params - Parámetros de búsqueda.
   * @returns {Object} Resultado normalizado con origen `demo`.
   */
  function getDemo(params) {
    var query = String(params.query || '').trim().toLocaleLowerCase('es');
    var orientation = params.orientation || '';
    var page = Math.max(1, Number(params.page) || 1);
    var perPage = Math.max(1, Number(params.perPage) || Config.SETTINGS.perPage);

    var list = DemoData.photos.filter(function (photo) {
      if (orientation && photo.orientation !== orientation) {
        return false;
      }
      if (!query) {
        return true;
      }
      var haystack = [photo.alt, photo.tags, photo.photographer, photo.category]
        .join(' ').toLocaleLowerCase('es');
      return haystack.indexOf(query) !== -1;
    });

    var start = (page - 1) * perPage;

    return {
      photos: list.slice(start, start + perPage),
      totalResults: list.length,
      page: page,
      perPage: perPage,
      source: 'demo',
      warning: ''
    };
  }

  /**
   * Punto de entrada único para buscar fotografías.
   * Intenta usar la API real si hay clave; si falla, degrada al modo demo
   * devolviendo además un mensaje de aviso para mostrar al usuario.
   *
   * @param {Object} params - Parámetros de búsqueda.
   * @returns {Promise<Object>} Resultado con fotos, metadatos y origen.
   */
  function search(params) {
    var options = Object.assign({
      query: '',
      orientation: '',
      page: 1,
      perPage: Config.SETTINGS.perPage
    }, params || {});

    if (!hasApiKey()) {
      return Promise.resolve(getDemo(options));
    }

    return fetchLive(options).catch(function (error) {
      var fallback = getDemo(options);
      fallback.warning = error && error.message
        ? error.message + ' Mostrando fotos de ejemplo.'
        : 'No se pudo conectar con Pexels. Mostrando fotos de ejemplo.';
      fallback.error = error;
      return fallback;
    });
  }

  PG.Api = {
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    hasApiKey: hasApiKey,
    normalizePhoto: normalizePhoto,
    buildLiveUrl: buildLiveUrl,
    fetchLive: fetchLive,
    getDemo: getDemo,
    search: search
  };
})(window);
