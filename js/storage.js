/**
 * @file storage.js
 * @description Módulo de persistencia de favoritos usando el LocalStorage
 * del navegador. Centraliza lectura, escritura, altas/bajas y notificaciones
 * para que cualquier vista pueda reaccionar a los cambios.
 *
 * Expuesto como `PG.Storage`.
 */

(function (global) {
  'use strict';

  var PG = (global.PG = global.PG || {});
  var KEY = PG.Config.SETTINGS.storageKeys.favorites;
  var CHANGE_EVENT = 'pg:favoriteschange';

  /**
   * Lee y parsea la lista de favoritos almacenada.
   * Si los datos están corruptos, devuelve un array vacío sin lanzar errores.
   *
   * @returns {Array<Object>} Lista de fotos favoritas.
   */
  function all() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) { return []; }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Emite un evento personalizado en el `document` para avisar de un cambio.
   * Las vistas (contador del header, corazones, modal) se suscriben a él.
   *
   * @returns {void}
   */
  function emitChange() {
    var event = new global.CustomEvent(CHANGE_EVENT, { detail: { count: all().length } });
    document.dispatchEvent(event);
  }

  /**
   * Persiste una lista de favoritos.
   *
   * @param {Array<Object>} list - Lista completa a guardar.
   * @returns {boolean} `true` si se guardó correctamente.
   */
  function write(list) {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(list));
      emitChange();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Comprueba si una foto está marcada como favorita.
   *
   * @param {number|string} id - Identificador de la foto.
   * @returns {boolean} `true` si ya está en favoritos.
   */
  function isFavorite(id) {
    return all().some(function (photo) {
      return String(photo.id) === String(id);
    });
  }

  /**
   * Añade una foto a favoritos. No permite duplicados.
   *
   * @param {Object} photo - Foto normalizada a guardar.
   * @returns {boolean} `true` si se añadió; `false` si ya existía o falló.
   */
  function add(photo) {
    if (!photo || photo.id == null) { return false; }
    var list = all();
    if (list.some(function (item) { return String(item.id) === String(photo.id); })) {
      return false;
    }
    list.unshift(photo);
    return write(list);
  }

  /**
   * Elimina una foto de favoritos por su identificador.
   *
   * @param {number|string} id - Identificador de la foto.
   * @returns {boolean} `true` si se eliminó (o no existía y se guardó la lista).
   */
  function remove(id) {
    var list = all().filter(function (photo) {
      return String(photo.id) !== String(id);
    });
    return write(list);
  }

  /**
   * Alterna el estado de favorito de una foto.
   *
   * @param {Object} photo - Foto normalizada.
   * @returns {boolean} `true` si después de la operación es favorita.
   */
  function toggle(photo) {
    if (isFavorite(photo.id)) {
      remove(photo.id);
      return false;
    }
    add(photo);
    return true;
  }

  /**
   * Devuelve el número de favoritos guardados.
   *
   * @returns {number} Cantidad de favoritos.
   */
  function count() {
    return all().length;
  }

  /**
   * Elimina todos los favoritos.
   *
   * @returns {boolean} `true` si se pudo vaciar la lista.
   */
  function clear() {
    return write([]);
  }

  PG.Storage = {
    CHANGE_EVENT: CHANGE_EVENT,
    all: all,
    isFavorite: isFavorite,
    add: add,
    remove: remove,
    toggle: toggle,
    count: count,
    clear: clear
  };
})(window);
