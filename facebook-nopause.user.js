// ==UserScript==
// @name         Facebook play-video in background (Hard Mode)
// @namespace    https://github.com/Leproide/Facebook-play-video-in-background
// @version      1.0
// @description  Impedisce a Facebook di mettere in pausa i video quando cambi scheda
// @author       Leproide
// @include      https://*facebook.*
// @include      https://m.facebook.*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const FORBIDDEN_EVENTS = new Set([
    'visibilitychange',
    'webkitvisibilitychange',
    'pagehide',
    'freeze',
    'blur'
  ]);

  // Annulla i setter di handler globali che FB usa per stop
  function nullSetter(obj, prop) {
    try {
      Object.defineProperty(obj, prop, {
        set() {},
        get() { return null; },
        configurable: true
      });
    } catch (_) {}
  }
  nullSetter(window, 'onblur');
  nullSetter(window, 'onfocus');
  nullSetter(window, 'onpagehide');
  nullSetter(document, 'onvisibilitychange');

  // Spoofa Page Visibility: sempre visibile
  try {
    Object.defineProperty(document, 'hidden', {
      get() { return false; },
      configurable: true
    });
    Object.defineProperty(document, 'visibilityState', {
      get() { return 'visible'; },
      configurable: true
    });
  } catch (_) {}

  // hasFocus sempre true
  try {
    Document.prototype.hasFocus = function () { return true; };
  } catch (_) {}

  // Ferma sul nascere gli eventi critici (capturing, prima che arrivino a FB)
  for (const t of FORBIDDEN_EVENTS) {
    window.addEventListener(t, e => e.stopImmediatePropagation(), true);
    document.addEventListener(t, e => e.stopImmediatePropagation(), true);
  }

  // Blocca la registrazione futura di listener per quegli eventi
  const realAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, opts) {
    if (FORBIDDEN_EVENTS.has(String(type))) {
      // console.log('[FB-NOPAUSE] bloccato addEventListener', type);
      return;
    }
    return realAdd.call(this, type, listener, opts);
  };

  // Nasconde l'avviso "longtask" in console (opzionale)
  try {
    const PO = window.PerformanceObserver;
    if (PO && PO.supportedEntryTypes) {
      const filtered = PO.supportedEntryTypes.filter(t => t !== 'longtask');
      Object.defineProperty(window.PerformanceObserver, 'supportedEntryTypes', {
        value: filtered,
        configurable: true
      });
    }
  } catch (_) {}

  // Permette solo pause "umane": click/tasto recenti. Il resto lo ignora e rimette play.
  (function () {
    const proto = HTMLMediaElement.prototype;
    const realPause = proto.pause;
    const realPlay = proto.play;
    let lastUserGesture = 0;
    const bump = () => { lastUserGesture = Date.now(); };

    window.addEventListener('keydown', bump, true);
    window.addEventListener('mousedown', bump, true);
    window.addEventListener('pointerdown', bump, true);
    window.addEventListener('touchstart', bump, true);

    proto.pause = function (...args) {
      const since = Date.now() - lastUserGesture;
      if (since < 1000 || this.dataset.allowPause === '1') {
        return realPause.apply(this, args);
      }
      try { realPlay.call(this); } catch (_) {}
      return;
    };
  })();

  // Keep-alive: se qualcosa riesce ancora a mettere in pausa, lo riavvia
  const tick = () => {
    document.querySelectorAll('video').forEach(v => {
      if (v.paused) { v.play().catch(() => {}); }
    });
  };
  setInterval(tick, 1000);

  console.log('[FB-NOPAUSE] Hard mode attivo');
})();
