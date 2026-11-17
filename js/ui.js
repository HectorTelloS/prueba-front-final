/**
 * @file ui.js
 * @description Funciones puras de renderizado y utilidades de interfaz.
 * Generan el HTML de tarjetas, galería, paginación y modales. No contienen
 * lógica de negocio: reciben datos y devuelven/insertan marcado.
 *
 * Expuesto como `PG.UI`.
 */

(function (global) {
  'use strict';

  var PG = (global.PG = global.PG || {});

  /** Icono SVG de corazón reutilizable. @type {string} */
  var HEART_SVG = '<svg class="heart-icon" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">' +
    '<path d="M12 21s-7.5-4.6-9.6-9.1C.7 8.3 2.6 4.5 6.2 4c2.2-.3 4.2.8 5.8 2.8C13.6 4.8 15.6 3.7 17.8 4c3.6.5 5.5 4.3 3.8 7.9C19.5 16.4 12 21 12 21z"/></svg>';

  /** Icono SVG de flecha derecha. @type {string} */
  var ARROW_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /**
   * Escapa caracteres especiales para evitar inyección de HTML al insertar
   * textos procedentes de la API.
   *
   * @param {*} value - Valor a escapar.
   * @returns {string} Texto seguro para HTML.
   */
  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return map[char];
    });
  }

  /**
   * Genera el HTML de una tarjeta de categoría.
   *
   * @param {Object} category - Categoría de `PG.Config.CATEGORIES`.
   * @returns {string} HTML de la tarjeta.
   */
  function categoryCardHtml(category) {
    return '' +
      '<button type="button" class="category-card" data-category="' + escapeHtml(category.id) + '" ' +
        'style="--card-gradient:' + escapeHtml(category.gradient) + '" ' +
        'aria-label="Ver fotos de ' + escapeHtml(category.label) + '">' +
        '<span class="category-card__icon" aria-hidden="true">' + escapeHtml(category.icon) + '</span>' +
        '<span class="category-card__name">' + escapeHtml(category.label) + '</span>' +
        '<span class="category-card__desc">' + escapeHtml(category.description) + '</span>' +
        '<span class="category-card__cta">Ver colección ' + ARROW_SVG + '</span>' +
      '</button>';
  }

  /**
   * Pinta las tarjetas de categorías en su contenedor.
   *
   * @param {HTMLElement} container - Contenedor del grid.
   * @param {Array<Object>} categories - Categorías a mostrar.
   * @returns {void}
   */
  function renderCategories(container, categories) {
    container.innerHTML = categories.map(categoryCardHtml).join('');
  }

  /**
   * Genera el HTML de una tarjeta de foto con su botón de favorito.
   *
   * @param {Object} photo - Foto normalizada.
   * @param {boolean} isFavorite - Si debe mostrarse el corazón activo.
   * @returns {string} HTML de la tarjeta.
   */
  function photoCardHtml(photo, isFavorite) {
    var id = escapeHtml(photo.id);
    var active = isFavorite ? ' is-active' : '';
    var pressed = isFavorite ? 'true' : 'false';
    var label = isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos';
    var image = photo.src && photo.src.medium ? photo.src.medium : (photo.src && photo.src.large) || '';

    return '' +
      '<article class="photo-card" data-id="' + id + '">' +
        '<div class="photo-card__media">' +
          '<img src="' + escapeHtml(image) + '" ' +
            'alt="' + escapeHtml(photo.alt) + '" ' +
            'loading="lazy" decoding="async" ' +
            'width="' + escapeHtml(photo.width || 800) + '" ' +
            'height="' + escapeHtml(photo.height || 600) + '">' +
          '<div class="photo-card__error">Imagen no disponible</div>' +
          '<button type="button" class="fav-btn' + active + '" data-action="favorite" ' +
            'data-id="' + id + '" aria-label="' + label + '" aria-pressed="' + pressed + '" ' +
            'title="' + label + '">' + HEART_SVG + '</button>' +
        '</div>' +
        '<div class="photo-card__info">' +
          '<p class="photo-card__author" title="' + escapeHtml(photo.photographer) + '">' +
            escapeHtml(photo.photographer) +
          '</p>' +
          '<a class="photo-card__link" href="' + escapeHtml(photo.url) + '" ' +
            'target="_blank" rel="noopener noreferrer" ' +
            'aria-label="Ver foto original en Pexels (se abre en otra pestaña)">Pexels ↗</a>' +
        '</div>' +
      '</article>';
  }

  /**
   * Pinta una galería de fotos.
   *
   * @param {HTMLElement} container - Contenedor de la galería.
   * @param {Array<Object>} photos - Fotos a renderizar.
   * @param {Function} isFavoriteFn - Función que decide si una foto es favorita.
   * @returns {void}
   */
  function renderGallery(container, photos, isFavoriteFn) {
    container.innerHTML = photos.map(function (photo) {
      return photoCardHtml(photo, isFavoriteFn(photo.id));
    }).join('');
  }

  /**
   * Muestra tarjetas esqueleto mientras cargan los datos.
   *
   * @param {HTMLElement} container - Contenedor de la galería.
   * @param {number} [amount=8] - Cantidad de esqueletos.
   * @returns {void}
   */
  function renderSkeletons(container, amount) {
    var count = amount || 8;
    var heights = [220, 300, 260, 340, 200, 290];
    var html = '';
    for (var i = 0; i < count; i += 1) {
      html += '<div class="skeleton-card" aria-hidden="true">' +
        '<div class="skeleton-card__media" style="height:' + heights[i % heights.length] + 'px"></div>' +
        '<div class="skeleton-card__line"></div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  /**
   * Calcula la lista de páginas a mostrar (con elipsis para rangos largos).
   *
   * @param {number} current - Página activa.
   * @param {number} total - Total de páginas.
   * @returns {Array<number|string>} Números de página y '…'.
   */
  function getPageItems(current, total) {
    var items = [];
    var i;

    if (total <= 7) {
      for (i = 1; i <= total; i += 1) { items.push(i); }
      return items;
    }

    items.push(1);
    if (current > 3) { items.push('…'); }

    var start = Math.max(2, current - 1);
    var end = Math.min(total - 1, current + 1);
    for (i = start; i <= end; i += 1) { items.push(i); }

    if (current < total - 2) { items.push('…'); }
    items.push(total);
    return items;
  }

  /**
   * Dibuja la navegación de paginación.
   *
   * @param {HTMLElement} container - Contenedor (<nav>) de la paginación.
   * @param {Object} state - Estado de resultados.
   * @param {number} state.page - Página actual.
   * @param {number} state.totalResults - Total de imágenes.
   * @param {number} state.perPage - Imágenes por página.
   * @returns {void}
   */
  function renderPagination(container, state) {
    var totalPages = Math.ceil(state.totalResults / state.perPage);

    if (totalPages <= 1) {
      container.innerHTML = '';
      container.hidden = true;
      return;
    }

    var html = '<button type="button" class="page-btn" data-page="' + (state.page - 1) + '" ' +
      'aria-label="Página anterior" ' + (state.page === 1 ? 'disabled' : '') + '>‹</button>';

    getPageItems(state.page, totalPages).forEach(function (item) {
      if (item === '…') {
        html += '<span class="page-ellipsis" aria-hidden="true">…</span>';
      } else {
        html += '<button type="button" class="page-btn' + (item === state.page ? ' is-current' : '') + '" ' +
          'data-page="' + item + '" ' +
          (item === state.page ? 'aria-current="page"' : 'aria-label="Ir a la página ' + item + '"') +
          '>' + item + '</button>';
      }
    });

    html += '<button type="button" class="page-btn" data-page="' + (state.page + 1) + '" ' +
      'aria-label="Página siguiente" ' + (state.page === totalPages ? 'disabled' : '') + '>›</button>';

    container.innerHTML = html;
    container.hidden = false;
  }

  /**
   * Muestra una notificación temporal (toast).
   *
   * @param {string} message - Texto a mostrar.
   * @param {string} [type='info'] - `success`, `error` o `info`.
   * @param {HTMLElement} region - Contenedor de toasts.
   * @returns {void}
   */
  function showToast(message, type, region) {
    if (!region) { return; }
    var kind = type || 'info';
    var icon = kind === 'success' ? '✓' : (kind === 'error' ? '!' : '✦');
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + kind;
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span class="toast__icon" aria-hidden="true">' + icon + '</span>' +
      '<span>' + escapeHtml(message) + '</span>';
    region.appendChild(toast);

    global.setTimeout(function () {
      toast.classList.add('is-leaving');
      global.setTimeout(function () {
        if (toast.parentNode) { toast.parentNode.removeChild(toast); }
      }, 260);
    }, 3200);
  }

  /**
   * Abre un modal guardando el elemento que tenía el foco.
   *
   * @param {HTMLElement} modal - Envoltorio del modal.
   * @returns {void}
   */
  function openModal(modal) {
    if (!modal) { return; }
    modal.__previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var focusable = modal.querySelector('input, button');
    if (focusable) { focusable.focus(); }
  }

  /**
   * Cierra un modal y devuelve el foco al elemento anterior.
   *
   * @param {HTMLElement} modal - Envoltorio del modal.
   * @returns {void}
   */
  function closeModal(modal) {
    if (!modal || modal.hidden) { return; }
    modal.hidden = true;
    document.body.style.overflow = '';
    if (modal.__previousFocus && typeof modal.__previousFocus.focus === 'function') {
      modal.__previousFocus.focus();
    }
  }

  /**
   * Indica si algún modal está abierto (para la tecla Escape).
   *
   * @returns {boolean} `true` si hay un modal visible.
   */
  function anyModalOpen() {
    var modals = document.querySelectorAll('.modal');
    for (var i = 0; i < modals.length; i += 1) {
      if (!modals[i].hidden) { return true; }
    }
    return false;
  }

  PG.UI = {
    escapeHtml: escapeHtml,
    renderCategories: renderCategories,
    renderGallery: renderGallery,
    renderSkeletons: renderSkeletons,
    renderPagination: renderPagination,
    getPageItems: getPageItems,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    anyModalOpen: anyModalOpen
  };
})(window);
