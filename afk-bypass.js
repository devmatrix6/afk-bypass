/**
 * ============================================================
 *  AFK Bypass — Iframe Edition
 *  Works on sites using afk.html iframes (e.g. lemonhost.me)
 *  Author: You
 *  Usage: See README.md
 * ============================================================
 *
 * HOW TO USE:
 *  1. Go to the AFK page (e.g. dash.lemonhost.me/dashboard/earn/afk)
 *  2. Open DevTools Console (F12)
 *  3. Switch context to the iframe: click "top ▼" → select "afk.html"
 *  4. Paste this entire script and press Enter
 *  5. Click "Start AFK" on the page
 *  6. Switch tabs freely — AFK will keep running
 *
 * TO STOP: Reload the page or call stopAFK() in the console
 * ============================================================
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // STEP 1: Lock visibilityState to 'visible' inside the iframe
  // The site checks: document.visibilityState === 'visible'
  // We make that always return true regardless of tab focus
  // ─────────────────────────────────────────────────────────
  try {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  } catch (e) {}

  try {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  } catch (e) {}

  try {
    Object.defineProperty(document, 'webkitVisibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  } catch (e) {}

  // Always report tab as focused
  document.hasFocus = () => true;

  // ─────────────────────────────────────────────────────────
  // STEP 2: Block visibilitychange event listeners
  // The site registers: document.addEventListener('visibilitychange', pauseFn)
  // We intercept addEventListener at the prototype level so their
  // pause handler never gets registered in the first place
  // ─────────────────────────────────────────────────────────
  const BLOCKED_EVENTS = new Set([
    'visibilitychange',
    'mozvisibilitychange',
    'msvisibilitychange',
    'webkitvisibilitychange',
    'blur',
    'focusout',
    'pagehide',
    'freeze',
  ]);

  const _addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (BLOCKED_EVENTS.has(type)) {
      console.log('[AFK] Blocked event listener registration: ' + type);
      return; // silently drop the listener
    }
    return _addEventListener.call(this, type, fn, opts);
  };

  // ─────────────────────────────────────────────────────────
  // STEP 3: Block dispatchEvent for these types too
  // Prevents any code from manually firing a visibilitychange
  // ─────────────────────────────────────────────────────────
  const _dispatchEvent = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function (e) {
    if (BLOCKED_EVENTS.has(e.type)) {
      return true; // pretend it was dispatched, do nothing
    }
    return _dispatchEvent.call(this, e);
  };

  // ─────────────────────────────────────────────────────────
  // STEP 4: Intercept fetch — allow credit POSTs, block pause signals
  // The site calls POST /api/user/billingafk/work every minute to award credits
  // We allow that through. Any pause/stop signals get faked as success.
  // ─────────────────────────────────────────────────────────
  const _fetch = window.fetch;
  window.fetch = async function (url, opts = {}) {
    const urlStr = String(url);
    const body   = String(opts.body || '');

    // Always allow the credit-earning endpoint
    if (urlStr.includes('/api/user/billingafk/work') ||
        urlStr.includes('/api/user/billingafk/start') ||
        urlStr.includes('/api/user/billingafk/status')) {
      return _fetch.apply(this, arguments);
    }

    // Block any pause/stop signals
    if (/pause|stop|inactive|blur|hidden/i.test(body) ||
        /pause|stop/i.test(urlStr)) {
      console.log('[AFK] Blocked fetch: ' + urlStr);
      return Promise.resolve(
        new Response('{"success":true}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    return _fetch.apply(this, arguments);
  };

  // ─────────────────────────────────────────────────────────
  // STEP 5: Intercept XHR (axios uses XHR under the hood)
  // ─────────────────────────────────────────────────────────
  const _xhrOpen = XMLHttpRequest.prototype.open;
  const _xhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._afkUrl = String(url);
    return _xhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const bodyStr = String(body || '');
    if (/pause|stop|inactive/i.test(this._afkUrl || '') ||
        /pause|stop|inactive/i.test(bodyStr)) {
      console.log('[AFK] Blocked XHR: ' + this._afkUrl);
      return; // drop the request
    }
    return _xhrSend.call(this, body);
  };

  // ─────────────────────────────────────────────────────────
  // STEP 6: Activity simulation using setInterval
  // (Web Workers are blocked by the site's CSP, so we use intervals)
  // ─────────────────────────────────────────────────────────
  const _intervals = [];

  // Simulate mouse movement every 6 seconds
  _intervals.push(
    setInterval(() => {
      document.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150 + Math.random() * 400,
          clientY: 150 + Math.random() * 300,
          bubbles: true,
        })
      );
    }, 6000)
  );

  // Simulate spacebar press every 5 seconds
  _intervals.push(
    setInterval(() => {
      ['keydown', 'keyup'].forEach((type) =>
        document.dispatchEvent(
          new KeyboardEvent(type, {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            which: 32,
            bubbles: true,
            cancelable: true,
          })
        )
      );
    }, 5000)
  );

  // ─────────────────────────────────────────────────────────
  // STOP FUNCTION
  // Call stopAFK() in the console to cleanly stop everything
  // ─────────────────────────────────────────────────────────
  window.stopAFK = () => {
    _intervals.forEach(clearInterval);
    console.log('[AFK] All intervals cleared. Reload page to fully reset.');
  };

  // ─────────────────────────────────────────────────────────
  // Done
  // ─────────────────────────────────────────────────────────
  console.log(
    '%c[AFK] ✅ Bypass active — visibilityState locked, listeners blocked, fetch/XHR patched.',
    'color: lime; font-weight: bold; font-size: 14px'
  );
  console.log(
    '%c[AFK] Now click "Start AFK" on the page, then switch tabs freely.',
    'color: cyan; font-size: 12px'
  );
  console.log(
    '%c[AFK] To stop: call stopAFK()',
    'color: orange; font-size: 12px'
  );
})();
