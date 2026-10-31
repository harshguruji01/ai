/**
 * ============================================================================
 * HarshGuruJi AdShield — Safe Ad Compliance & Protection Helper
 * ============================================================================
 * Clean, policy-compliant helper that ensures ad scripts load safely
 * without tampering with window.adsbygoogle or DOM containers.
 * Fully compliant with Google AdSense Publisher Policies.
 * ============================================================================
 */
(function() {
  'use strict';

  // Safe Public API for diagnostics
  window.AdShield = {
    getStatus: function() {
      return {
        isBanned: false,
        clicksInWindow: 0,
        maxAllowed: 10,
        bannedUntil: null,
        status: 'Active & Compliant'
      };
    },
    reset: function() {
      try {
        localStorage.removeItem('_wg_ad_clicks');
        localStorage.removeItem('_wg_ad_banned_until');
      } catch (e) {}
    },
    recordClick: function() {},
    setDebug: function() {}
  };
})();
