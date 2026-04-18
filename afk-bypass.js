// AFK Bypass — Iframe Edition
// Made by Nanodevs

(function () {
  'use strict';

  try { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); } catch (e) {}
  try { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); } catch (e) {}
  try { Object.defineProperty(document, 'webkitVisibilityState', { configurable: true, get: () => 'visible' }); } catch (e) {}

  document.hasFocus = () => true;

  const BLOCKED_EVENTS = new Set([
    'visibilitychange', 'mozvisibilitychange', 'msvisibilitychange',
    'webkitvisibilitychange', 'blur', 'focusout', 'pagehide', 'freeze',
  ]);

  const _addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (BLOCKED_EVENTS.has(type)) return;
    return _addEventListener.call(this, type, fn, opts);
  };

  const _dispatchEvent = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function (e) {
    if (BLOCKED_EVENTS.has(e.type)) return true;
    return _dispatchEvent.call(this, e);
  };

  const _fetch = window.fetch;
  window.fetch = async function (url, opts = {}) {
    const urlStr = String(url);
    const body = String(opts.body || '');
    if (/pause|stop|inactive/i.test(urlStr) || /pause|stop|inactive/i.test(body)) {
      return Promise.resolve(new Response('{"success":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return _fetch.apply(this, arguments);
  };

  const _xhrOpen = XMLHttpRequest.prototype.open;
  const _xhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._afkUrl = String(url);
    return _xhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (/pause|stop|inactive/i.test(this._afkUrl || '') || /pause|stop|inactive/i.test(String(body || ''))) return;
    return _xhrSend.call(this, body);
  };

  const _intervals = [];

  _intervals.push(setInterval(() => {
    document.dispatchEvent(new MouseEvent('mousemove', {
      clientX: 150 + Math.random() * 400,
      clientY: 150 + Math.random() * 300,
      bubbles: true,
    }));
  }, 6000));

  _intervals.push(setInterval(() => {
    ['keydown', 'keyup'].forEach((type) =>
      document.dispatchEvent(new KeyboardEvent(type, {
        key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true, cancelable: true,
      }))
    );
  }, 5000));

  window.stopAFK = () => {
    _intervals.forEach(clearInterval);
    console.log('[AFK] Stopped.');
  };

  console.log('%c[AFK] ✅ Bypass active — switch tabs freely. stopAFK() to stop.', 'color:lime;font-weight:bold;font-size:14px');

})();
