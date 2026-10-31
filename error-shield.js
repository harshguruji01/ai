/**
 * ============================================================================
 * HarshGuruJi Universal Error & Stability Shield (error-shield.js)
 * ============================================================================
 * Zero-crash runtime protection and responsive safety engine.
 * Protects against:
 *   1. Unhandled runtime exceptions & unhandled promise rejections
 *   2. Broken image links (404/network fails) with automatic SVG recovery
 *   3. Private browsing & QuotaExceeded storage exceptions (localStorage/sessionStorage)
 *   4. Viewport horizontal overflow & mobile layout breakage
 *   5. Null DOM pointer exceptions in dynamic scripts
 * Functional Enhancements:
 *   6. Universal Toast Notification: window.showToast(message, type, duration)
 *   7. Universal Modal & Lightbox dismissal on Escape key and backdrop clicks
 *   8. Universal Copy-To-Clipboard handler for [data-copy] and .copy-btn
 *   9. Universal Share handler for [data-share] and .share-btn
 *  10. Tactile Download feedback for .btn-download and download links
 * ============================================================================
 */
(function(window, document) {
  'use strict';

  if (!window || !document) return;

  // 0. CANONICAL APEX DOMAIN ENFORCEMENT: Redirect www.webguruji.online or http -> https://webguruji.online
  try {
    if (window.location) {
      var isWww = window.location.hostname === 'www.webguruji.online';
      var isInsecureApex = window.location.protocol === 'http:' && window.location.hostname === 'webguruji.online';
      if (isWww || isInsecureApex) {
        var canonicalUrl = 'https://webguruji.online' + window.location.pathname + window.location.search + window.location.hash;
        window.location.replace(canonicalUrl);
        return;
      }
    }
  } catch (e) {}

  if (window.__HARSHGURUJI_ERROR_SHIELD_ACTIVE__) return;
  window.__HARSHGURUJI_ERROR_SHIELD_ACTIVE__ = true;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DEFAULT BEAUTIFUL FALLBACK SVG ICONS (Inline Base64 / URI)
  // ═══════════════════════════════════════════════════════════════════════════
  var APP_ICON_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><defs><linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e293b'/><stop offset='100%' stop-color='%230f172a'/></linearGradient><linearGradient id='accent' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%236366f1'/><stop offset='100%' stop-color='%23a855f7'/></linearGradient></defs><rect width='100' height='100' rx='22' fill='url(%23bg)' stroke='%23334155' stroke-width='2'/><path d='M50 24 L74 38 L74 66 L50 80 L26 66 L26 38 Z' fill='none' stroke='url(%23accent)' stroke-width='4' stroke-linejoin='round'/><path d='M50 24 L50 80 M26 38 L74 66 M26 66 L74 38' stroke='%23475569' stroke-width='1.5'/><circle cx='50' cy='52' r='8' fill='url(%23accent)'/></svg>";

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. GLOBAL UNHANDLED ERROR & PROMISE REJECTION BOUNDARY
  // ═══════════════════════════════════════════════════════════════════════════
  window.addEventListener('error', function(event) {
    var target = event.target;
    // Check if it's an asset load error
    if (target && target.tagName) {
      var tag = target.tagName.toUpperCase();
      if (tag === 'IMG') {
        recoverBrokenImage(target);
        if (event.preventDefault) event.preventDefault();
        return;
      }
      if (tag === 'SCRIPT' || tag === 'LINK') {
        // Silent recovery for non-critical assets (e.g. ad scripts blocked by uBlock)
        return;
      }
    }

    // Script execution error
    if (window.__WG_DEBUG__) {
      console.warn('[ErrorShield Caught]', event.message, 'at', event.filename + ':' + event.lineno);
    }
  }, true);

  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = (reason && (reason.message || reason.toString())) || '';
    
    // Check for common benign network/abort rejections (e.g. Supabase cancelled, AdBlock, offline)
    var isBenign = message.indexOf('AbortError') !== -1 ||
                   message.indexOf('Failed to fetch') !== -1 ||
                   message.indexOf('NetworkError') !== -1 ||
                   message.indexOf('Load failed') !== -1 ||
                   message.indexOf('QuotaExceededError') !== -1;

    if (window.__WG_DEBUG__ || !isBenign) {
      console.warn('[ErrorShield Handled Rejection]', message);
    }

    // Suppress console crash
    if (event.preventDefault) {
      event.preventDefault();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. AUTONOMOUS BROKEN IMAGE RECOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  function recoverBrokenImage(img) {
    if (!img || img.dataset.shieldRecovered) return;
    img.dataset.shieldRecovered = '1';

    // Prevent recursive loop
    img.onerror = null;

    var customFallback = img.getAttribute('data-fallback') || img.getAttribute('data-placeholder');
    var finalSrc = customFallback || APP_ICON_FALLBACK;

    // Apply smooth visual styling so the fallback looks polished
    img.classList.add('img-shield-recovered');
    img.src = finalSrc;
  }

  // Intercept images dynamically inserted via JavaScript
  if (typeof MutationObserver !== 'undefined') {
    var imgObserver = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') {
              bindImageGuard(node);
            } else if (node.querySelectorAll) {
              var nestedImgs = node.querySelectorAll('img');
              for (var k = 0; k < nestedImgs.length; k++) {
                bindImageGuard(nestedImgs[k]);
              }
            }
          }
        }
      }
    });

    function startImgObserver() {
      if (document.body) {
        imgObserver.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          imgObserver.observe(document.body, { childList: true, subtree: true });
        });
      }
    }
    startImgObserver();
  }

  function bindImageGuard(img) {
    if (!img || img.dataset.shieldGuarded) return;
    img.dataset.shieldGuarded = '1';
    img.addEventListener('error', function() {
      recoverBrokenImage(img);
    }, { once: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. STORAGE SAFETY WRAPPER (localStorage / sessionStorage)
  // ═══════════════════════════════════════════════════════════════════════════
  (function initSafeStorage() {
    function createMemoryStorage() {
      var store = {};
      return {
        getItem: function(key) {
          return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
        },
        setItem: function(key, val) {
          store[key] = String(val);
        },
        removeItem: function(key) {
          delete store[key];
        },
        clear: function() {
          store = {};
        },
        key: function(index) {
          var keys = Object.keys(store);
          return keys[index] || null;
        },
        get length() {
          return Object.keys(store).length;
        }
      };
    }

    var lsAvailable = false;
    try {
      var testKey = '__wg_shield_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      lsAvailable = true;
    } catch (e) {
      lsAvailable = false;
    }

    if (!lsAvailable) {
      try {
        var memStorage = createMemoryStorage();
        Object.defineProperty(window, 'localStorage', {
          value: memStorage,
          configurable: true,
          writable: true
        });
      } catch (err) {
        window._safeLocalStorage = createMemoryStorage();
      }
    } else {
      var originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = function(k, v) {
        try {
          originalSetItem.call(window.localStorage, k, v);
        } catch (quotaErr) {
          try {
            originalSetItem.call(window.localStorage, k, v);
          } catch (e) {
            // Silently survive
          }
        }
      };
    }
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ACTIVE HORIZONTAL ZERO-OVERFLOW DETECTOR & AUTO-CLAMP
  // ═══════════════════════════════════════════════════════════════════════════
  function clampHorizontalOverflow() {
    if (!document.body) return;
    var clientW = document.documentElement.clientWidth || window.innerWidth;
    if (!clientW || clientW <= 0) return;

    if (document.body.scrollWidth > clientW + 1) {
      var allElements = document.body.querySelectorAll('*');
      for (var i = 0; i < allElements.length; i++) {
        var el = allElements[i];
        if (el.offsetWidth > clientW || el.scrollWidth > clientW) {
          el.style.maxWidth = '100%';
          el.style.boxSizing = 'border-box';
          
          var tag = el.tagName;
          if (tag === 'TABLE' || tag === 'PRE' || tag === 'CODE') {
            el.style.display = 'block';
            el.style.overflowX = 'auto';
            el.style.webkitOverflowScrolling = 'touch';
          } else if (tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME') {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
          } else {
            var compStyle = window.getComputedStyle(el);
            if (compStyle.overflowX === 'visible') {
              el.style.overflowX = 'hidden';
            }
          }
        }
      }
    }
  }

  var resizeTimer = null;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(clampHorizontalOverflow, 120);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clampHorizontalOverflow);
  } else {
    clampHorizontalOverflow();
  }
  window.addEventListener('load', clampHorizontalOverflow);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. UNIVERSAL TOAST NOTIFICATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  var toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'wg-toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  window.showToast = function(message, type, duration) {
    if (!message) return;
    type = type || 'info';
    duration = duration || 3500;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        window.showToast(message, type, duration);
      }, { once: true });
      return;
    }

    var container = ensureToastContainer();
    var toast = document.createElement('div');
    toast.className = 'wg-toast wg-toast-' + type;

    var iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = iconSvg + '<span style="flex:1;">' + message + '</span>';

    container.appendChild(toast);

    function removeToast() {
      if (toast.classList.contains('wg-toast-hiding')) return;
      toast.classList.add('wg-toast-hiding');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }

    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. UNIVERSAL MODAL & LIGHTBOX DISMISSAL (Escape Key & Backdrop Clicks)
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      // Find open modals and close them
      var openModals = document.querySelectorAll(
        '.modal.active, .modal.show, .app-modal.active, #lightbox-modal.active, ' +
        '.lightbox-overlay.active, .modal-overlay.active, [data-modal].active, dialog[open]'
      );
      for (var i = 0; i < openModals.length; i++) {
        var m = openModals[i];
        if (m.tagName === 'DIALOG' && m.close) {
          m.close();
        } else {
          m.classList.remove('active', 'show');
        }
      }
      document.body.classList.remove('modal-open');
    }
  });

  // Global click delegate for overlay backdrop clicks
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target) return;

    // 1. Close modal if clicking directly on overlay
    if (target.classList && (
      target.classList.contains('modal-overlay') ||
      target.classList.contains('app-modal-overlay') ||
      target.classList.contains('lightbox-overlay')
    )) {
      target.classList.remove('active', 'show');
      document.body.classList.remove('modal-open');
      return;
    }

    // 2. Universal Copy to Clipboard handler
    var copyBtn = target.closest('[data-copy], .copy-btn, .btn-copy');
    if (copyBtn) {
      e.preventDefault();
      var copyText = copyBtn.getAttribute('data-copy') ||
                     copyBtn.getAttribute('data-text') ||
                     window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(function() {
          window.showToast('Copied to clipboard!', 'success');
        }).catch(function() {
          fallbackCopy(copyText);
        });
      } else {
        fallbackCopy(copyText);
      }
      return;
    }

    // 3. Universal Share handler
    var shareBtn = target.closest('[data-share], .share-btn');
    if (shareBtn) {
      e.preventDefault();
      var shareTitle = document.title || 'HarshGuruJi';
      var shareUrl = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: shareTitle,
          url: shareUrl
        }).catch(function() { /* User cancelled */ });
      } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(function() {
            window.showToast('Link copied to clipboard!', 'success');
          });
        } else {
          fallbackCopy(shareUrl);
        }
      }
      return;
    }

    // 4. Download Feedback
    var dlBtn = target.closest('.btn-download, .box-download-btn, .app-btn-download-tag, [data-download]');
    if (dlBtn && !dlBtn.dataset.downloadNotified) {
      dlBtn.dataset.downloadNotified = '1';
      window.showToast('Preparing verified download...', 'info', 2500);
      setTimeout(function() {
        delete dlBtn.dataset.downloadNotified;
      }, 4000);
    }
  });

  function fallbackCopy(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      window.showToast('Copied to clipboard!', 'success');
    } catch (err) {
      window.showToast('Copy failed, please select and copy manually.', 'error');
    }
    document.body.removeChild(textArea);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. SAFE DOM UTILITIES (window.safeEl, window.safeListen)
  // ═══════════════════════════════════════════════════════════════════════════
  window.safeEl = function(selector, context) {
    try {
      var ctx = context || document;
      return ctx.querySelector(selector);
    } catch (e) {
      return null;
    }
  };

  window.safeListen = function(target, event, handler, options) {
    if (!target) return;
    try {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el && el.addEventListener) {
        el.addEventListener(event, handler, options);
      }
    } catch (e) {
      if (window.__WG_DEBUG__) console.warn('[ErrorShield safeListen failed]', e);
    }
  };

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : null);
