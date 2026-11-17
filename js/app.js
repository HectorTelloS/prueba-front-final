/**
 * @file app.js
 * @description Controlador principal de la aplicación. Gestiona el estado,
 * conecta la capa de datos (Api/Storage) con la vista (UI) y atiende todos
 * los eventos del usuario: búsqueda, filtros, paginación, favoritos y modales.
 *
 * Expuesto como `PG.App`.
 */

(function (global) {
  'use strict';

  var PG = global.PG;
  var Config = PG.Config;
  var Api = PG.Api;
  var Storage = PG.Storage;
  var UI = PG.UI;

  /**
   * Estado global de la interfaz.
   * @type {Object}
   */
  var state = {
    view: 'categories',
    query: '',
    categoryId: null,
    categoryLabel: '',
    orientation: '',
    page: 1,
    perPage: Config.SETTINGS.perPage,
    totalResults: 0,
    photos: [],
    loading: false,
    requestId: 0
  };

  /** Referencias a elementos del DOM. @type {Object} */
  var el = {};

  /** Cachea las referencias al DOM usadas con frecuencia. @returns {void} */
  function cacheDom() {
    var ids = [
      'homeBtn', 'exploreBtn', 'favoritesBtn', 'favoritesCount', 'settingsBtn',
      'searchForm', 'searchInput', 'searchError', 'orientationGroup',
      'categoriesSection', 'categoriesGrid', 'resultsSection', 'resultsTitle',
      'resultsMeta', 'sourceBadge', 'modeNotice', 'modeNoticeText', 'modeNoticeAction',
      'gallery', 'emptyState', 'emptyStateText', 'emptyResetBtn', 'pagination',
      'favoritesModal', 'favoritesGallery', 'favoritesEmpty', 'favoritesModalCount',
      'favoritesFooter', 'favoritesEmptyAction', 'clearFavoritesBtn',
      'settingsModal', 'settingsForm', 'apiKeyInput', 'apiKeyError', 'removeApiKeyBtn',
      'toastRegion'
    ];
    ids.forEach(function (id) { el[id] = document.getElementById(id); });
  }

  /**
   * Notificación rápida con el tipo indicado.
   *
   * @param {string} message - Mensaje.
   * @param {string} [type] - Tipo de toast.
   * @returns {void}
   */
  function notify(message, type) {
    UI.showToast(message, type, el.toastRegion);
  }

  /**
   * Actualiza el contador del botón de favoritos.
   *
   * @returns {void}
   */
  function updateFavoritesBadge() {
    var count = Storage.count();
    el.favoritesCount.textContent = String(count);
    el.favoritesCount.classList.toggle('is-active', count > 0);
    el.favoritesCount.setAttribute('aria-label', count + (count === 1 ? ' favorito' : ' favoritos'));
  }

  /**
   * Sincroniza el aspecto de todos los botones de favorito con el Storage.
   *
   * @returns {void}
   */
  function syncFavoriteButtons() {
    var buttons = document.querySelectorAll('.fav-btn');
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      var active = Storage.isFavorite(button.getAttribute('data-id'));
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      var label = active ? 'Quitar de favoritos' : 'Añadir a favoritos';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
    }
  }

  /**
   * Busca una foto normalizada por id, primero en los resultados actuales y
   * después en el almacén de favoritos.
   *
   * @param {number|string} id - Identificador buscado.
   * @returns {Object|null} La foto encontrada o `null`.
   */
  function findPhoto(id) {
    var i;
    for (i = 0; i < state.photos.length; i += 1) {
      if (String(state.photos[i].id) === String(id)) { return state.photos[i]; }
    }
    var favorites = Storage.all();
    for (i = 0; i < favorites.length; i += 1) {
      if (String(favorites[i].id) === String(id)) { return favorites[i]; }
    }
    return null;
  }

  /**
   * Vuelve a la vista de inicio con las tres categorías.
   *
   * @returns {void}
   */
  function goHome() {
    state.view = 'categories';
    state.query = '';
    state.categoryId = null;
    state.categoryLabel = '';
    state.orientation = '';
    state.page = 1;
    state.requestId += 1;

    el.searchInput.value = '';
    el.searchError.textContent = '';
    el.searchForm.querySelector('.search__field').classList.remove('has-error');
    var radios = el.orientationGroup.querySelectorAll('input[name="orientation"]');
    for (var i = 0; i < radios.length; i += 1) {
      radios[i].checked = radios[i].value === '';
    }

    el.resultsSection.hidden = true;
    el.categoriesSection.hidden = false;
    el.modeNotice.hidden = true;
    global.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Ejecuta una búsqueda (por texto o por categoría) y pinta los resultados.
   *
   * @param {Object} [options] - Opciones de búsqueda.
   * @param {string} [options.query] - Texto libre introducido por el usuario.
   * @param {string} [options.categoryId] - Id de categoría de `Config`.
   * @param {number} [options.page] - Página solicitada.
   * @param {boolean} [options.validate] - Validar la entrada con regex.
   * @returns {void}
   */
  function runSearch(options) {
    var opts = options || {};

    if (opts.validate) {
      var result = Config.validateQuery(el.searchInput.value);
      el.searchError.textContent = result.message;
      el.searchForm.querySelector('.search__field').classList.toggle('has-error', !result.valid);
      if (!result.valid) {
        el.searchInput.focus();
        return;
      }
      state.query = el.searchInput.value.trim();
      state.categoryId = null;
      state.categoryLabel = '';
    }

    if (opts.categoryId) {
      var category = null;
      Config.CATEGORIES.forEach(function (item) {
        if (item.id === opts.categoryId) { category = item; }
      });
      if (!category) { return; }
      state.categoryId = category.id;
      state.categoryLabel = category.label;
      state.query = category.query;
      state.page = 1;
    }

    if (typeof opts.page === 'number') { state.page = Math.max(1, opts.page); }

    // Determinar el texto real que se envía a la API (categoría → query).
    var apiQuery = state.query;
    if (state.categoryId) {
      Config.CATEGORIES.forEach(function (item) {
        if (item.id === state.categoryId) { apiQuery = item.query; }
      });
    }

    var currentRequest = ++state.requestId;
    state.view = 'results';
    state.loading = true;
    el.categoriesSection.hidden = true;
    el.resultsSection.hidden = false;
    el.emptyState.hidden = true;
    el.pagination.hidden = true;
    el.gallery.setAttribute('aria-busy', 'true');
    UI.renderSkeletons(el.gallery, 8);

    // Título descriptivo de la vista.
    if (state.categoryLabel) {
      el.resultsTitle.textContent = state.categoryLabel;
    } else {
      el.resultsTitle.textContent = 'Resultados para “' + state.query + '”';
    }

    Api.search({
      query: apiQuery,
      orientation: state.orientation,
      page: state.page,
      perPage: state.perPage
    }).then(function (data) {
      if (currentRequest !== state.requestId) { return; }
      state.loading = false;
      state.photos = data.photos || [];
      state.totalResults = data.totalResults || 0;
      state.page = data.page || state.page;
      renderResults(data);
    }).catch(function (error) {
      if (currentRequest !== state.requestId) { return; }
      state.loading = false;
      state.photos = [];
      state.totalResults = 0;
      el.gallery.innerHTML = '';
      el.gallery.setAttribute('aria-busy', 'false');
      el.emptyState.hidden = false;
      el.emptyStateText.textContent = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
      notify(error && error.message ? error.message : 'No se pudieron cargar las imágenes.', 'error');
    });
  }

  /**
   * Pinta la galería, metadatos, avisos y paginación tras una búsqueda.
   *
   * @param {Object} data - Resultado devuelto por `PG.Api.search`.
   * @returns {void}
   */
  function renderResults(data) {
    var totalPages = Math.max(1, Math.ceil(state.totalResults / state.perPage));

    el.gallery.setAttribute('aria-busy', 'false');
    el.resultsMeta.textContent = state.totalResults + (state.totalResults === 1 ? ' imagen' : ' imágenes') +
      ' · Página ' + state.page + ' de ' + totalPages;

    // Origen de los datos
    var isLive = data.source === 'live';
    el.sourceBadge.textContent = isLive ? '● Pexels API' : '● Modo demostración';
    el.sourceBadge.classList.toggle('is-live', isLive);
    el.sourceBadge.title = isLive
      ? 'Los datos provienen de la API de Pexels'
      : 'Los datos provienen del catálogo de ejemplo incluido';

    // Aviso de modo demostración / error de conexión
    if (data.warning) {
      el.modeNoticeText.textContent = data.warning;
      el.modeNotice.hidden = false;
    } else if (!isLive) {
      el.modeNoticeText.textContent = 'Estás viendo el catálogo de ejemplo. Añade tu clave de Pexels ' +
        'para consultar fotografías reales en vivo.';
      el.modeNotice.hidden = false;
    } else {
      el.modeNotice.hidden = true;
    }

    if (state.photos.length === 0) {
      el.gallery.innerHTML = '';
      el.emptyState.hidden = false;
      el.emptyStateText.textContent = 'No hay coincidencias con esos filtros. Prueba otra palabra ' +
        'o cambia la orientación.';
    } else {
      el.emptyState.hidden = true;
      UI.renderGallery(el.gallery, state.photos, Storage.isFavorite);
      // Marca las imágenes ya cargadas desde caché del navegador.
      markLoadedImages(el.gallery);
    }

    UI.renderPagination(el.pagination, {
      page: state.page,
      totalResults: state.totalResults,
      perPage: state.perPage
    });

    syncFavoriteButtons();
  }

  /**
   * Marca como cargadas las imágenes que ya están en caché (complete=true)
   * para que no queden invisibles por la animación de opacidad.
   *
   * @param {HTMLElement} container - Contenedor de la galería.
   * @returns {void}
   */
  function markLoadedImages(container) {
    var images = container.querySelectorAll('img');
    for (var i = 0; i < images.length; i += 1) {
      if (images[i].complete && images[i].naturalWidth > 0) {
        images[i].parentNode.classList.add('is-loaded');
      }
    }
  }

  /**
   * Vuelve a pintar la galería de favoritos dentro de su modal.
   *
   * @returns {void}
   */
  function renderFavoritesModal() {
    var favorites = Storage.all();
    var isOpen = !el.favoritesModal.hidden;

    el.favoritesModalCount.textContent = String(favorites.length);
    if (favorites.length === 0) {
      el.favoritesGallery.innerHTML = '';
      el.favoritesEmpty.hidden = false;
      el.favoritesFooter.hidden = true;
      return;
    }

    el.favoritesEmpty.hidden = true;
    el.favoritesFooter.hidden = false;
    UI.renderGallery(el.favoritesGallery, favorites, function () { return true; });
    markLoadedImages(el.favoritesGallery);
    if (isOpen) { /* el scroll se mantiene al repintar */ }
  }

  /**
   * Abre el modal de favoritos refrescando su contenido.
   *
   * @returns {void}
   */
  function openFavorites() {
    renderFavoritesModal();
    UI.openModal(el.favoritesModal);
  }

  /**
   * Abre el modal de configuración con la clave actual precargada.
   *
   * @returns {void}
   */
  function openSettings() {
    el.apiKeyInput.value = Api.getApiKey();
    el.apiKeyError.textContent = '';
    UI.openModal(el.settingsModal);
  }

  /**
   * Alterna el estado de favorito de una foto y avisa al usuario.
   *
   * @param {number|string} id - Id de la foto.
   * @returns {void}
   */
  function toggleFavorite(id) {
    var photo = findPhoto(id);
    if (!photo) { return; }

    var nowFavorite = Storage.toggle(photo);
    notify(nowFavorite ? 'Foto añadida a favoritos.' : 'Foto eliminada de favoritos.',
      nowFavorite ? 'success' : 'info');
  }

  /**
   * Registra todos los listeners de eventos de la aplicación.
   *
   * @returns {void}
   */
  function bindEvents() {
    // Navegación
    el.homeBtn.addEventListener('click', goHome);
    el.exploreBtn.addEventListener('click', goHome);
    el.backBtn && el.backBtn.addEventListener('click', goHome);
    el.emptyResetBtn.addEventListener('click', goHome);
    el.favoritesEmptyAction.addEventListener('click', function () {
      UI.closeModal(el.favoritesModal);
      goHome();
    });
    el.modeNoticeAction.addEventListener('click', openSettings);

    // Búsqueda
    el.searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch({ validate: true });
    });

    // Filtro de orientación (delegado en el grupo de radios)
    el.orientationGroup.addEventListener('change', function (event) {
      if (event.target && event.target.name === 'orientation') {
        state.orientation = event.target.value;
        if (state.view === 'results') {
          runSearch({ page: 1 });
        }
      }
    });

    // Categorías (delegado)
    el.categoriesGrid.addEventListener('click', function (event) {
      var card = event.target.closest('[data-category]');
      if (card) { runSearch({ categoryId: card.getAttribute('data-category') }); }
    });

    // Paginación (delegado)
    el.pagination.addEventListener('click', function (event) {
      var button = event.target.closest('[data-page]');
      if (!button || button.disabled) { return; }
      var page = parseInt(button.getAttribute('data-page'), 10);
      var totalPages = Math.ceil(state.totalResults / state.perPage);
      if (page < 1 || page > totalPages || page === state.page) { return; }
      runSearch({ page: page });
      el.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Favoritos (delegado global: funciona en galería y en el modal)
    document.addEventListener('click', function (event) {
      var favButton = event.target.closest('[data-action="favorite"]');
      if (favButton) {
        toggleFavorite(favButton.getAttribute('data-id'));
        return;
      }
      var closer = event.target.closest('[data-close-modal]');
      if (closer) {
        var modal = closer.closest('.modal');
        if (modal) { UI.closeModal(modal); }
      }
    });

    // Reacción a cambios en el almacenamiento de favoritos
    document.addEventListener(Storage.CHANGE_EVENT, function () {
      updateFavoritesBadge();
      syncFavoriteButtons();
      if (!el.favoritesModal.hidden) { renderFavoritesModal(); }
    });

    // Acciones de favoritos
    el.favoritesBtn.addEventListener('click', openFavorites);
    el.clearFavoritesBtn.addEventListener('click', function () {
      if (Storage.count() === 0) { return; }
      if (global.confirm('¿Vaciar todos tus favoritos? Esta acción no se puede deshacer.')) {
        Storage.clear();
        notify('Se vaciaron tus favoritos.', 'info');
      }
    });

    // Configuración de API
    el.settingsBtn.addEventListener('click', openSettings);
    el.settingsForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var key = el.apiKeyInput.value.trim();
      if (key.length < 10) {
        el.apiKeyError.textContent = 'La clave parece demasiado corta. Comprueba que esté completa.';
        return;
      }
      if (!Api.setApiKey(key)) {
        el.apiKeyError.textContent = 'No se pudo guardar. Revisa la configuración del navegador.';
        return;
      }
      UI.closeModal(el.settingsModal);
      notify('Clave guardada. Recargando resultados…', 'success');
      if (state.view === 'results') { runSearch({ page: 1 }); }
    });
    el.removeApiKeyBtn.addEventListener('click', function () {
      Api.setApiKey('');
      el.apiKeyInput.value = '';
      el.apiKeyError.textContent = '';
      notify('Clave eliminada. Se usa el modo demostración.', 'info');
      if (state.view === 'results') { runSearch({ page: 1 }); }
    });

    // Cierre con Escape y manejo de errores de imagen
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && UI.anyModalOpen()) {
        var modals = document.querySelectorAll('.modal');
        for (var i = 0; i < modals.length; i += 1) {
          if (!modals[i].hidden) { UI.closeModal(modals[i]); }
        }
      }
    });

    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG' && target.closest('.photo-card')) {
        target.closest('.photo-card__media').classList.add('is-error');
      }
    }, true);

    // Carga correcta de imágenes → revelar con opacidad (delegado capture)
    document.addEventListener('load', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG' && target.closest('.photo-card')) {
        target.closest('.photo-card__media').classList.add('is-loaded');
      }
    }, true);
  }

  /**
   * Inicializa la aplicación.
   *
   * @returns {void}
   */
  function init() {
    cacheDom();
    UI.renderCategories(el.categoriesGrid, Config.CATEGORIES);
    updateFavoritesBadge();
    bindEvents();
  }

  // Arranque cuando el DOM esté listo (soporta script al final del body).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  PG.App = {
    init: init,
    runSearch: runSearch,
    goHome: goHome,
    getState: function () { return state; }
  };
})(window);
