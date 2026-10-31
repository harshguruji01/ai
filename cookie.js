/**
 * HarshGuruJi - Production Cookie Consent Manager & Policy Interactivity Script
 * Manages localStorage consent state, banner display, preferences modal, and TOC scrolling.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'harshguruji_cookie_consent';
  const EXPIRATION_DAYS = 365;

  // Default Cookie Preference Schema
  const defaultPreferences = {
    essential: true,      // Always true
    analytics: false,
    performance: false,
    functional: true,
    personalization: false,
    marketing: false,
    thirdParty: false,
    timestamp: null
  };

  // Get saved preferences from localStorage
  function getSavedPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Check expiration
      if (parsed.timestamp && (Date.now() - parsed.timestamp > EXPIRATION_DAYS * 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn('[Cookie Consent] Failed reading localStorage', e);
      return null;
    }
  }

  // Save preferences to localStorage
  function savePreferences(prefs) {
    try {
      prefs.timestamp = Date.now();
      prefs.essential = true; // Hard lock
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      // Also update legacy cookieAccepted key for backward compatibility
      localStorage.setItem('cookieAccepted', 'true');
      console.log('[Cookie Consent] Preferences saved:', prefs);
    } catch (e) {
      console.error('[Cookie Consent] Error saving preferences', e);
    }
  }

  // Inject Cookie Banner into DOM
  function createCookieBanner() {
    if (document.getElementById('cookie-consent-banner')) return;

    const bannerHtml = `
      <div id="cookie-consent-banner" class="cookie-banner-wrap" role="region" aria-label="Cookie Consent Banner">
        <div class="cookie-banner-content">
          <div class="cookie-banner-text-side">
            <div class="cookie-banner-title">
              <span>🍪</span> Cookie & Privacy Settings
            </div>
            <p class="cookie-banner-desc">
              We use essential cookies and local storage to ensure site security, enable fast loading, and optimize learning tools. You can customize your preferences anytime. Learn more in our <a href="cookie.html">Cookie Policy</a>.
            </p>
          </div>
          <div class="cookie-banner-actions">
            <button id="btn-cookie-accept-all" class="btn-cookie-accept">Accept All</button>
            <button id="btn-cookie-reject-nonessential" class="btn-cookie-reject">Reject Non-Essential</button>
            <button id="btn-cookie-customize-prefs" class="btn-cookie-customize">Customize</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHtml);
  }

  // Inject Cookie Preferences Modal into DOM
  function createCookieModal() {
    if (document.getElementById('cookie-preferences-modal')) return;

    const modalHtml = `
      <div id="cookie-preferences-modal" class="cookie-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal-box">
          <div class="cookie-modal-header">
            <h3 id="cookie-modal-title">⚙️ Cookie Preferences</h3>
            <button id="btn-close-cookie-modal" class="cookie-modal-close" aria-label="Close preferences modal">&times;</button>
          </div>
          <div class="cookie-modal-body">
            <!-- Essential -->
            <div class="cookie-category-item">
              <div class="category-info">
                <h4>🔒 Essential Storage <span class="badge-always-active">Always Active</span></h4>
                <p>Required for platform security, CSRF protection, navigation, and user authentication state. Cannot be disabled.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked disabled id="toggle-cookie-essential">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Functional -->
            <div class="cookie-category-item">
              <div class="category-info">
                <h4>🛠️ Functional Storage</h4>
                <p>Remembers local preferences, BMI history, password generation defaults, and study bookmark state.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-cookie-functional">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Analytics -->
            <div class="cookie-category-item">
              <div class="category-info">
                <h4>📊 Analytics & Performance</h4>
                <p>Helps us understand how learning tools are used so we can improve site speed and content layout.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-cookie-analytics">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Personalization -->
            <div class="cookie-category-item">
              <div class="category-info">
                <h4>🎨 Personalization</h4>
                <p>Saves custom dark theme preferences, font sizes, and AI prompt quick-access widgets.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-cookie-personalization">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Third Party & Marketing -->
            <div class="cookie-category-item">
              <div class="category-info">
                <h4>🌐 Third-Party & Embedded Media</h4>
                <p>Allows third-party embeds (such as YouTube tutorial players and Google Ads integrations) to operate.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-cookie-thirdparty">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="cookie-modal-footer">
            <button id="btn-save-cookie-preferences" class="btn btn-primary" style="padding:0.6rem 1.4rem;">Save My Preferences</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Bind Event Handlers for Banner and Modal
  function setupEventListeners() {
    const banner = document.getElementById('cookie-consent-banner');
    const modal = document.getElementById('cookie-preferences-modal');

    // Banner Buttons
    const acceptAllBtn = document.getElementById('btn-cookie-accept-all');
    const rejectNonEssentialBtn = document.getElementById('btn-cookie-reject-nonessential');
    const customizeBtn = document.getElementById('btn-cookie-customize-prefs');

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        const allPrefs = {
          essential: true,
          analytics: true,
          performance: true,
          functional: true,
          personalization: true,
          marketing: true,
          thirdParty: true
        };
        savePreferences(allPrefs);
        hideBanner();
      });
    }

    if (rejectNonEssentialBtn) {
      rejectNonEssentialBtn.addEventListener('click', () => {
        const minPrefs = {
          essential: true,
          analytics: false,
          performance: false,
          functional: true,
          personalization: false,
          marketing: false,
          thirdParty: false
        };
        savePreferences(minPrefs);
        hideBanner();
      });
    }

    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        hideBanner();
        openModal();
      });
    }

    // Modal Controls
    const closeModalBtn = document.getElementById('btn-close-cookie-modal');
    const savePrefsBtn = document.getElementById('btn-save-cookie-preferences');

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeModal);
    }

    if (savePrefsBtn) {
      savePrefsBtn.addEventListener('click', () => {
        const customPrefs = {
          essential: true,
          functional: document.getElementById('toggle-cookie-functional')?.checked || false,
          analytics: document.getElementById('toggle-cookie-analytics')?.checked || false,
          performance: document.getElementById('toggle-cookie-analytics')?.checked || false,
          personalization: document.getElementById('toggle-cookie-personalization')?.checked || false,
          marketing: document.getElementById('toggle-cookie-thirdparty')?.checked || false,
          thirdParty: document.getElementById('toggle-cookie-thirdparty')?.checked || false
        };
        savePreferences(customPrefs);
        closeModal();
      });
    }

    // Reopen Modal Triggers (from page buttons or footer)
    document.querySelectorAll('#btn-open-cookie-preferences-nav, #btn-reopen-cookie-modal-sidebar, #btn-reopen-cookie-modal-content, [data-open-cookie-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close modal when clicking outside box
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Keyboard ESC key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function showBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      setTimeout(() => {
        banner.classList.add('active');
      }, 500);
    }
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('active');
    }
  }

  function openModal() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (!modal) return;

    // Load current states
    const saved = getSavedPreferences() || defaultPreferences;
    const funcToggle = document.getElementById('toggle-cookie-functional');
    const analyticsToggle = document.getElementById('toggle-cookie-analytics');
    const personalizationToggle = document.getElementById('toggle-cookie-personalization');
    const thirdPartyToggle = document.getElementById('toggle-cookie-thirdparty');

    if (funcToggle) funcToggle.checked = saved.functional;
    if (analyticsToggle) analyticsToggle.checked = saved.analytics;
    if (personalizationToggle) personalizationToggle.checked = saved.personalization;
    if (thirdPartyToggle) thirdPartyToggle.checked = saved.thirdParty;

    modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // ── TABLE OF CONTENTS FILTER & SCROLL SPY FOR COOKIE.HTML ──
  function setupTocNavigation() {
    const tocSearch = document.getElementById('cookie-toc-search');
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;

    if (tocSearch) {
      tocSearch.addEventListener('input', () => {
        const query = tocSearch.value.toLowerCase().trim();
        const items = tocList.querySelectorAll('li');
        items.forEach(li => {
          const text = li.innerText.toLowerCase();
          li.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // TOC Active ScrollSpy
    const sections = document.querySelectorAll('.cookie-policy-content section');
    const tocLinks = document.querySelectorAll('.toc-link');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      sections.forEach(sec => {
        const secTop = sec.offsetTop - 150;
        if (window.scrollY >= secTop) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // Initialize System on DOMReady
  document.addEventListener('DOMContentLoaded', () => {
    createCookieBanner();
    createCookieModal();
    setupEventListeners();
    setupTocNavigation();

    const saved = getSavedPreferences();
    if (!saved) {
      showBanner();
    }
  });

})();
