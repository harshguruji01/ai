// Early bounce check removed to prevent premature redirect before login
// Global early PWA install prompt capture across all pages
if (typeof window !== 'undefined' && !window.__hgPromptCaptured) {
  window.__hgPromptCaptured = true;
  window.__hgDeferredPrompt = window.__hgDeferredPrompt || null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__hgDeferredPrompt = e;
    window.deferredPwaPrompt = e;
    window.dispatchEvent(new CustomEvent('hg-pwa-ready'));
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // --- Context-Aware Path Resolver ---
  // The prefix helps correctly link assets/pages if we are currently inside a subdirectory (e.g. /games/snake.html)
  const isSubDir = window.location.pathname.includes('/tools/') || 
                   window.location.pathname.includes('/games/') || 
                   window.location.pathname.includes('/learning/') || 
                   window.location.pathname.includes('/oauth/') || 
                   window.location.pathname.includes('/Quiz');
  const prefix = isSubDir ? '../' : '';

  // Remove old implementations if present
  const oldNav = document.getElementById('hg-global-navbar');
  const oldMobile = document.getElementById('hg-mobile-nav');
  const oldBottom = document.getElementById('hg-bottom-bar');
  const oldFloatingChat = document.getElementById('hg-floating-chat-btn');
  if (oldNav) oldNav.remove();
  if (oldMobile) oldMobile.remove();
  if (oldBottom) oldBottom.remove();
  if (oldFloatingChat) oldFloatingChat.remove();
  
  // Legacy cleanup
  document.querySelectorAll('.premium-navbar, .premium-mobile-nav').forEach(el => el.remove());

  // Context-Aware Host and Route Detection
  const navHost = window.location.hostname.toLowerCase();
  const navPath = (window.location.pathname || '').toLowerCase();
  const navFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const isStorePage = navHost.startsWith('store.') || 
                      navHost.includes('store') || 
                      navPath.includes('/store') || 
                      navFile.includes('store') || 
                      navFile === 'app.html';

  const isBooksPage = navHost.startsWith('books.') || 
                      navHost.includes('books') || 
                      navPath.includes('/books') || 
                      navFile.includes('book');

  // ONLY Home Page (index.html / root /) on the main website domain should have the Download HarshGuruJi banner
  const isMainHomePage = !isStorePage && !isBooksPage && (navFile === 'index.html' || navFile === '' || navPath === '/' || navPath === '');

  if (isMainHomePage) {
    // Ensure PWA Install & Shortcut resources are loaded ONLY on home page
    if (!document.getElementById('hg-pwa-css')) {
      const pwaLink = document.createElement('link');
      pwaLink.id = 'hg-pwa-css';
      pwaLink.rel = 'stylesheet';
      pwaLink.href = `${prefix}css/pwa-install.css`;
      document.head.appendChild(pwaLink);
    }
    if (!window.__HG_PWA_INITIALIZED__ && !document.getElementById('hg-pwa-js')) {
      const pwaScript = document.createElement('script');
      pwaScript.id = 'hg-pwa-js';
      pwaScript.src = `${prefix}js/pwa-install.js`;
      pwaScript.defer = true;
      document.body.appendChild(pwaScript);
    }
  } else {
    // On every other page, strictly remove any Download / Install banner or modal from the screen
    const strayBanner = document.getElementById('hg-pwa-banner');
    if (strayBanner) strayBanner.remove();
    const strayModal = document.getElementById('hg-pwa-modal');
    if (strayModal) strayModal.remove();
  }

  const isLocal = window.location.protocol === 'file:' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

  const homeUrl = isLocal ? `${prefix}index.html` : 'https://webguruji.online/';
  const booksUrl = isBooksPage ? (navFile === 'books.html' ? '#top' : `${prefix}books.html`) : (isLocal ? `${prefix}books.html` : 'https://books.webguruji.online/');
  const storeUrl = isStorePage ? (navFile === 'store.html' ? '#top' : `${prefix}store.html`) : (isLocal ? `${prefix}store.html` : 'https://store.webguruji.online/');
  const chatUrl = isLocal ? `${prefix}chat.html` : 'https://chat.webguruji.online/';

  // Universal Navigation & Cross-Subdomain Central Authentication Targets
  const portalUrl = (isStorePage || isBooksPage) && !isLocal ? 'https://webguruji.online/' : prefix;
  const currentFullUrl = typeof window !== 'undefined' ? window.location.href : '';
  const currentPathWithSearch = typeof window !== 'undefined' ? (window.location.pathname.split('/').pop() + window.location.search) : '';
  // Central Login Target: ALWAYS points to https://login.webguruji.online with current page redirect
  let centralLoginBase;
  if (isLocal || window.location.protocol === 'file:') {
    centralLoginBase = (window.location.protocol === 'file:' && (isStorePage || isBooksPage)) ? '../../site/login.html' : `${prefix}login.html`;
  } else {
    centralLoginBase = 'https://login.webguruji.online';
  }

  const safeReturnUrl = currentFullUrl || (typeof window !== 'undefined' ? (window.location.origin + window.location.pathname + window.location.search) : '');
  const loginUrl = `${centralLoginBase}?redirect=${encodeURIComponent(safeReturnUrl)}`;
  const dashUrl = (isBooksPage && !isLocal) ? 'https://webguruji.online/dashboard.html' : `${prefix}dashboard.html`;
  const settingsUrl = (isBooksPage && !isLocal) ? 'https://webguruji.online/settings.html' : `${prefix}settings.html`;

  // Build Desktop Nav Items
  let desktopNavListHTML = '';
  let mobileNavListHTML = '';
  let bottomBarHTML = '';

  if (isBooksPage) {
    desktopNavListHTML = `
      <li class="hg-nav-item"><a href="${homeUrl}" class="hg-nav-link" id="nav-link-home">Home</a></li>
      <li class="hg-nav-item"><a href="${booksUrl}" class="hg-nav-link active" id="nav-link-books">📚 All Books</a></li>
      <li class="hg-nav-item hg-has-dropdown" id="nav-item-classes">
        <a href="#" class="hg-nav-link" id="nav-link-classes" onclick="return false;">🎓 Classes <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></a>
        <div class="hg-dropdown hg-dropdown-classes">
          <div class="hg-classes-heading">Senior Secondary</div>
          <div class="hg-classes-grid">
            <a href="${booksUrl}?class=12" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('12'); return false;">Class 12</a>
            <a href="${booksUrl}?class=11" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('11'); return false;">Class 11</a>
          </div>
          <div class="hg-dropdown-divider"></div>
          <div class="hg-classes-heading">Secondary</div>
          <div class="hg-classes-grid">
            <a href="${booksUrl}?class=10" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('10'); return false;">Class 10</a>
            <a href="${booksUrl}?class=9" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('9'); return false;">Class 9</a>
          </div>
          <div class="hg-dropdown-divider"></div>
          <div class="hg-classes-heading">Middle &amp; Primary</div>
          <div class="hg-classes-grid-4">
            <a href="${booksUrl}?class=8" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('8'); return false;">Cl. 8</a>
            <a href="${booksUrl}?class=7" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('7'); return false;">Cl. 7</a>
            <a href="${booksUrl}?class=6" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('6'); return false;">Cl. 6</a>
            <a href="${booksUrl}?class=5" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('5'); return false;">Cl. 5</a>
            <a href="${booksUrl}?class=4" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('4'); return false;">Cl. 4</a>
            <a href="${booksUrl}?class=3" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('3'); return false;">Cl. 3</a>
            <a href="${booksUrl}?class=2" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('2'); return false;">Cl. 2</a>
            <a href="${booksUrl}?class=1" class="hg-dropdown-link" onclick="window.selectNavBookClass && window.selectNavBookClass('1'); return false;">Cl. 1</a>
          </div>
        </div>
      </li>
      <li class="hg-nav-item hg-has-dropdown" id="nav-item-subjects">
        <a href="#" class="hg-nav-link" id="nav-link-subjects" onclick="return false;">📖 Subjects <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></a>
        <div class="hg-dropdown" style="min-width:240px;">
          <a href="${booksUrl}?q=Mathematics" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Mathematics'); return false;">📐 Mathematics (Maths)</a>
          <a href="${booksUrl}?q=Science" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Science'); return false;">🔬 Science</a>
          <a href="${booksUrl}?q=Physics" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Physics'); return false;">⚡ Physics</a>
          <a href="${booksUrl}?q=Chemistry" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Chemistry'); return false;">🧪 Chemistry</a>
          <a href="${booksUrl}?q=Biology" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Biology'); return false;">🧬 Biology</a>
          <a href="${booksUrl}?q=Social+Science" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Social Science'); return false;">🌍 Social Science &amp; History</a>
          <a href="${booksUrl}?q=Hindi" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Hindi'); return false;">✍️ Hindi (हिंदी)</a>
          <a href="${booksUrl}?q=English" class="hg-dropdown-link" onclick="window.selectNavBookSubject && window.selectNavBookSubject('English'); return false;">📖 English</a>
        </div>
      </li>
      <li class="hg-nav-item"><a href="#step-box-class" class="hg-nav-link" id="nav-link-finder" onclick="window.scrollToBookFinder && window.scrollToBookFinder(); return false;">🎯 4-Step Finder</a></li>
      <li class="hg-nav-item"><a href="${storeUrl}" class="hg-nav-link" id="nav-link-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">🛍️ Store</a></li>
      <li class="hg-nav-item hg-has-dropdown" id="nav-item-more">
        <a href="#" class="hg-nav-link" id="nav-link-more" onclick="return false;">More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></a>
        <div class="hg-dropdown">
          <a href="${chatUrl}" class="hg-dropdown-link" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">💬 Community Chat</a>
          <a href="${portalUrl}daily-special.html" class="hg-dropdown-link">🌟 Daily Special</a>
          <a href="${portalUrl}free-tools.html" class="hg-dropdown-link">🛠️ Tools Hub</a>
          <a href="${portalUrl}ai-hub.html" class="hg-dropdown-link">🤖 AI Hub</a>
          <a href="${portalUrl}gaming-hub.html" class="hg-dropdown-link">🎮 Gaming Hub</a>
          <a href="${portalUrl}contributor.html" class="hg-dropdown-link">🤝 Contributor</a>
          <div class="hg-dropdown-divider"></div>
          <a href="${portalUrl}about.html" class="hg-dropdown-link">About Us</a>
          <a href="${portalUrl}contact.html" class="hg-dropdown-link">Contact</a>
          <a href="${portalUrl}privacy-policy.html" class="hg-dropdown-link">Privacy Policy</a>
          <a href="${portalUrl}terms-and-conditions.html" class="hg-dropdown-link">Terms &amp; Conditions</a>
        </div>
      </li>
    `;

    mobileNavListHTML = `
      <li><a href="${homeUrl}" class="hg-mobile-link" id="mob-link-home">🏠 Home</a></li>
      <li><a href="${booksUrl}" class="hg-mobile-link active" id="mob-link-books">📚 All Books Library</a></li>
      <li class="hg-mobile-item hg-has-accordion" id="mob-item-classes">
        <button type="button" class="hg-mobile-accordion-toggle">🎓 Select Class (1 to 12) <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button>
        <div class="hg-mobile-accordion-content">
          <div class="hg-mobile-classes-pill-grid">
            <a href="${booksUrl}?class=12" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('12'); return false;">Class 12</a>
            <a href="${booksUrl}?class=11" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('11'); return false;">Class 11</a>
            <a href="${booksUrl}?class=10" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('10'); return false;">Class 10</a>
            <a href="${booksUrl}?class=9" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('9'); return false;">Class 9</a>
            <a href="${booksUrl}?class=8" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('8'); return false;">Class 8</a>
            <a href="${booksUrl}?class=7" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('7'); return false;">Class 7</a>
            <a href="${booksUrl}?class=6" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('6'); return false;">Class 6</a>
            <a href="${booksUrl}?class=5" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('5'); return false;">Class 5</a>
            <a href="${booksUrl}?class=4" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('4'); return false;">Class 4</a>
            <a href="${booksUrl}?class=3" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('3'); return false;">Class 3</a>
            <a href="${booksUrl}?class=2" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('2'); return false;">Class 2</a>
            <a href="${booksUrl}?class=1" class="hg-mobile-class-btn" onclick="window.selectNavBookClass && window.selectNavBookClass('1'); return false;">Class 1</a>
          </div>
        </div>
      </li>
      <li class="hg-mobile-item hg-has-accordion" id="mob-item-subjects">
        <button type="button" class="hg-mobile-accordion-toggle">📖 Browse by Subject <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button>
        <div class="hg-mobile-accordion-content">
          <a href="${booksUrl}?q=Mathematics" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Mathematics'); return false;">📐 Mathematics (Maths)</a>
          <a href="${booksUrl}?q=Science" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Science'); return false;">🔬 Science &amp; Physics</a>
          <a href="${booksUrl}?q=Chemistry" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Chemistry'); return false;">🧪 Chemistry &amp; Biology</a>
          <a href="${booksUrl}?q=Social+Science" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Social Science'); return false;">🌍 Social Science &amp; History</a>
          <a href="${booksUrl}?q=Hindi" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('Hindi'); return false;">✍️ Hindi (हिंदी)</a>
          <a href="${booksUrl}?q=English" class="hg-mobile-sublink" onclick="window.selectNavBookSubject && window.selectNavBookSubject('English'); return false;">📖 English</a>
        </div>
      </li>
      <li><a href="#step-box-class" class="hg-mobile-link" id="mob-link-finder" onclick="window.scrollToBookFinder && window.scrollToBookFinder(); return false;">🎯 4-Step Book Finder</a></li>
      <li><a href="${storeUrl}" class="hg-mobile-link" id="mob-link-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">🛍️ GuruStore</a></li>
      <li class="hg-mobile-item hg-has-accordion" id="mob-item-more">
        <button type="button" class="hg-mobile-accordion-toggle">More Portal Services <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button>
        <div class="hg-mobile-accordion-content">
          <a href="${chatUrl}" class="hg-mobile-sublink" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">💬 Community Chat</a>
          <a href="${portalUrl}daily-special.html" class="hg-mobile-sublink">🌟 Daily Special</a>
          <a href="${portalUrl}free-tools.html" class="hg-mobile-sublink">🛠️ Tools Hub</a>
          <a href="${portalUrl}ai-hub.html" class="hg-mobile-sublink">🤖 AI Hub</a>
          <a href="${portalUrl}gaming-hub.html" class="hg-mobile-sublink">🎮 Gaming Hub</a>
          <a href="${portalUrl}contributor.html" class="hg-mobile-sublink">🤝 Contributor</a>
          <a href="${portalUrl}about.html" class="hg-mobile-sublink">About Us</a>
          <a href="${portalUrl}contact.html" class="hg-mobile-sublink">Contact</a>
          <a href="${portalUrl}privacy-policy.html" class="hg-mobile-sublink">Privacy Policy</a>
          <a href="${portalUrl}terms-and-conditions.html" class="hg-mobile-sublink">Terms &amp; Conditions</a>
        </div>
      </li>
    `;

    bottomBarHTML = `
      <a href="${homeUrl}" class="hg-bottom-item" id="bottom-nav-home" title="Portal Home">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span class="hg-bottom-label">Home</span>
      </a>

      <a href="#step-box-class" class="hg-bottom-item" id="bottom-nav-finder" title="4-Step Finder" onclick="window.scrollToBookFinder && window.scrollToBookFinder(); return false;">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </span>
        <span class="hg-bottom-label">Finder</span>
      </a>

      <a href="${booksUrl}" class="hg-bottom-item hg-bottom-item-home active" id="bottom-nav-books" title="NCERT Books">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Books</span>
      </a>

      <a href="#class-pills-row" class="hg-bottom-item" id="bottom-nav-classes" title="Select Class" onclick="window.scrollToClasses && window.scrollToClasses(); return false;">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Classes</span>
      </a>

      <a href="${storeUrl}" class="hg-bottom-item" id="bottom-nav-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer" title="GuruStore">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Store</span>
      </a>

      <a href="${loginUrl}" class="hg-bottom-item" id="bottom-nav-auth" title="Profile / Account">
        <span class="hg-bottom-icon" id="bottom-auth-icon-wrap">
          <svg id="bottom-auth-default-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <img id="bottom-auth-avatar" src="${prefix}logo.png" alt="Profile" style="display:none;" />
          <span id="bottom-golden-tick" class="bottom-golden-tick" style="display:none;">✓</span>
        </span>
        <span class="hg-bottom-label" id="bottom-auth-label">Login</span>
      </a>
    `;
  } else if (isStorePage) {
    desktopNavListHTML = `
      <!-- ReUI / 21st.dev Style Navigation Menu Trigger with Mega Menu Panel -->
      <li class="hg-nav-item hg-has-dropdown hg-reui-nav-item" id="nav-item-store-getting-started">
        <button type="button" class="hg-nav-link hg-reui-trigger active" id="nav-link-store-main" aria-expanded="false">
          <span>🛍️ GuruStore</span>
          <svg class="hg-reui-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
        <!-- ReUI / 21st.dev Card Panel with Description Previews -->
        <div class="hg-dropdown hg-reui-mega-panel">
          <div class="hg-reui-mega-grid">
            <a href="${storeUrl}" class="hg-reui-card" id="reui-card-all">
              <div class="hg-reui-card-icon" style="background:rgba(56,189,248,0.12); color:#38bdf8;">📦</div>
              <div class="hg-reui-card-body">
                <div class="hg-reui-card-title">GuruStore Catalog</div>
                <div class="hg-reui-card-desc">Browse complete verified inventory of games, applications, and tools.</div>
              </div>
            </a>
            <a href="#sec-games" class="hg-reui-card" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Game'); return false;">
              <div class="hg-reui-card-icon" style="background:rgba(236,72,153,0.12); color:#f472b6;">🎮</div>
              <div class="hg-reui-card-body">
                <div class="hg-reui-card-title">Web &amp; PC Games</div>
                <div class="hg-reui-card-desc">Play instant browser games like Chess, Snake, and Tic-Tac-Toe.</div>
              </div>
            </a>
            <a href="#sec-android" class="hg-reui-card" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('platform', 'Android'); return false;">
              <div class="hg-reui-card-icon" style="background:rgba(16,185,129,0.12); color:#34d399;">📱</div>
              <div class="hg-reui-card-body">
                <div class="hg-reui-card-title">Android APK Releases</div>
                <div class="hg-reui-card-desc">Direct high-speed downloads scanned across multi-engine antivirus.</div>
              </div>
            </a>
            <a href="#store-sections-view" class="hg-reui-card" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('platform', 'Windows'); return false;">
              <div class="hg-reui-card-icon" style="background:rgba(99,102,241,0.12); color:#818cf8;">💻</div>
              <div class="hg-reui-card-body">
                <div class="hg-reui-card-title">Windows Software</div>
                <div class="hg-reui-card-desc">Verified desktop utilities, emulators, and productive installers.</div>
              </div>
            </a>
          </div>
          <div class="hg-reui-mega-footer">
            <span class="hg-reui-footer-label">🛡️ 100% Cryptographically Verified &amp; Sandboxed Downloads</span>
            <a href="${portalUrl}free-tools.html" class="hg-reui-footer-link">Developer Tools Hub &rarr;</a>
          </div>
        </div>
      </li>

      <!-- ReUI Secondary Trigger: Categories -->
      <li class="hg-nav-item hg-has-dropdown hg-reui-nav-item" id="nav-item-categories">
        <button type="button" class="hg-nav-link hg-reui-trigger" id="nav-link-categories" aria-expanded="false">
          <span>Categories</span>
          <svg class="hg-reui-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
        <div class="hg-dropdown hg-reui-dropdown-panel">
          <a href="#store-sections-view" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Featured'); return false;">
            <span class="reui-link-icon">⭐</span>
            <div class="reui-link-text">
              <span class="reui-link-title">Editor's Choice</span>
              <span class="reui-link-desc">Featured handpicked apps &amp; games</span>
            </div>
          </a>
          <a href="#sec-games" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Game'); return false;">
            <span class="reui-link-icon">🎮</span>
            <div class="reui-link-text">
              <span class="reui-link-title">Games &amp; Play</span>
              <span class="reui-link-desc">Interactive web games &amp; brain puzzles</span>
            </div>
          </a>
          <a href="#sec-android" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Apps'); return false;">
            <span class="reui-link-icon">📱</span>
            <div class="reui-link-text">
              <span class="reui-link-title">Mobile Applications</span>
              <span class="reui-link-desc">Android APK packages &amp; utilities</span>
            </div>
          </a>
          <a href="#store-sections-view" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Software'); return false;">
            <span class="reui-link-icon">💻</span>
            <div class="reui-link-text">
              <span class="reui-link-title">Desktop Software</span>
              <span class="reui-link-desc">Windows EXE &amp; utility tools</span>
            </div>
          </a>
          <a href="#store-sections-view" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'AI'); return false;">
            <span class="reui-link-icon">🤖</span>
            <div class="reui-link-text">
              <span class="reui-link-title">AI &amp; Productivity</span>
              <span class="reui-link-desc">Next-gen AI assistant tools</span>
            </div>
          </a>
          <div class="hg-dropdown-divider"></div>
          <a href="#store-sections-view" class="hg-dropdown-link" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'All'); return false;">
            <span class="reui-link-icon">🔄</span>
            <div class="reui-link-text">
              <span class="reui-link-title">View All Releases</span>
              <span class="reui-link-desc">Clear filters and show full inventory</span>
            </div>
          </a>
        </div>
      </li>

      <!-- ReUI Standard Direct Links -->
      <li class="hg-nav-item"><a href="${homeUrl}" class="hg-nav-link" id="nav-link-home">Home</a></li>
      <li class="hg-nav-item"><a href="${booksUrl}" class="hg-nav-link" id="nav-link-books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Books</a></li>
      <li class="hg-nav-item"><a href="${chatUrl}" class="hg-nav-link" id="nav-link-chat" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Chat</a></li>
      <li class="hg-nav-item"><a href="${portalUrl}free-tools.html" class="hg-nav-link" id="nav-link-tools">Tools</a></li>
    `;

    mobileNavListHTML = `
      <li>
        <a href="${storeUrl}" class="hg-mobile-link active" id="mob-link-store">
          <span>🛍️ GuruStore</span>
          <span style="font-size:0.75rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:2px 8px; border-radius:12px; font-weight:700;">LIVE</span>
        </a>
      </li>

      <li class="hg-mobile-item hg-has-accordion open" id="mob-item-store-cats">
        <button type="button" class="hg-mobile-accordion-toggle">
          <span>📂 Store Categories</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
        <div class="hg-mobile-accordion-content">
          <a href="#sec-games" class="hg-mobile-sublink" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Game'); return false;">
            <div style="font-weight:600; color:#fff;">🎮 Web Games</div>
            <div style="font-size:0.78rem; color:#94a3b8;">Chess, Snake, Tic-Tac-Toe &amp; Arcade</div>
          </a>
          <a href="#sec-android" class="hg-mobile-sublink" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('platform', 'Android'); return false;">
            <div style="font-weight:600; color:#fff;">📱 Android APKs</div>
            <div style="font-size:0.78rem; color:#94a3b8;">Direct verified APK installers</div>
          </a>
          <a href="#store-sections-view" class="hg-mobile-sublink" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('platform', 'Windows'); return false;">
            <div style="font-weight:600; color:#fff;">💻 Windows (PC)</div>
            <div style="font-size:0.78rem; color:#94a3b8;">Desktop software &amp; emulators</div>
          </a>
          <a href="#store-sections-view" class="hg-mobile-sublink" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'AI'); return false;">
            <div style="font-weight:600; color:#fff;">🤖 AI &amp; Web Apps</div>
            <div style="font-size:0.78rem; color:#94a3b8;">ChatBase, AI Hub &amp; productive tools</div>
          </a>
          <a href="#store-sections-view" class="hg-mobile-sublink" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'All'); return false;">
            <div style="font-weight:600; color:#38bdf8;">🔄 View All Releases</div>
            <div style="font-size:0.78rem; color:#94a3b8;">Browse complete catalog</div>
          </a>
        </div>
      </li>

      <li><a href="${homeUrl}" class="hg-mobile-link" id="mob-link-home">🏠 HarshGuruJi Home</a></li>
      <li><a href="${booksUrl}" class="hg-mobile-link" id="mob-link-books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">📚 NCERT Books Library</a></li>
      <li><a href="${chatUrl}" class="hg-mobile-link" id="mob-link-chat" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">💬 Community Chat</a></li>
      <li><a href="${portalUrl}free-tools.html" class="hg-mobile-link">🛠️ Free Developer Tools</a></li>
      <li><a href="${portalUrl}contact.html" class="hg-mobile-link">📬 Contact &amp; Support</a></li>
    `;

    bottomBarHTML = `
      <a href="${homeUrl}" class="hg-bottom-item" id="bottom-nav-home" title="Portal Home">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span class="hg-bottom-label">Home</span>
      </a>

      <a href="#sec-games" class="hg-bottom-item" id="bottom-nav-games" title="Web Games" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('category', 'Game'); return false;">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="6 12 10 8 14 12 10 16 6 12"></polygon>
            <path d="M18 11l-2-2 2-2"></path>
            <circle cx="16" cy="16" r="2"></circle>
          </svg>
        </span>
        <span class="hg-bottom-label">Games</span>
      </a>

      <a href="${storeUrl}" class="hg-bottom-item hg-bottom-item-home active" id="bottom-nav-store" title="GuruStore">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">GuruStore</span>
      </a>

      <a href="#sec-android" class="hg-bottom-item" id="bottom-nav-apks" title="Android APKs" onclick="window.selectStoreNavFilter && window.selectStoreNavFilter('platform', 'Android'); return false;">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </span>
        <span class="hg-bottom-label">APKs</span>
      </a>

      <a href="${booksUrl}" class="hg-bottom-item" id="bottom-nav-books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer" title="NCERT Books">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Books</span>
      </a>

      <a href="${portalUrl}free-tools.html" class="hg-bottom-item" id="bottom-nav-tools" title="Free Developer Tools">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Tools</span>
      </a>
    `;
  } else {
    // Default Portal Navigation
    desktopNavListHTML = `
      <li class="hg-nav-item"><a href="${prefix}index.html" class="hg-nav-link" id="nav-link-home">Home</a></li>
      <li class="hg-nav-item"><a href="${booksUrl}" class="hg-nav-link" id="nav-link-books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Books</a></li>
      <li class="hg-nav-item"><a href="${portalUrl}daily-special.html" class="hg-nav-link" id="nav-link-dailyspecial">Daily Special</a></li>
      <li class="hg-nav-item"><a href="${storeUrl}" class="hg-nav-link" id="nav-link-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Store</a></li>
      <li class="hg-nav-item"><a href="${chatUrl}" class="hg-nav-link" id="nav-link-chat" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Chat</a></li>
      <li class="hg-nav-item"><a href="${portalUrl}contributor.html" class="hg-nav-link" id="nav-link-contributor">Contributor</a></li>
      <li class="hg-nav-item hg-has-dropdown" id="nav-item-more">
        <a href="#" class="hg-nav-link" id="nav-link-more" onclick="return false;">More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></a>
        <div class="hg-dropdown">
          <a href="${portalUrl}free-tools.html" class="hg-dropdown-link">🛠️ Tools Hub</a>
          <a href="${portalUrl}ai-hub.html" class="hg-dropdown-link">🤖 AI Hub</a>
          <a href="${portalUrl}learning-hub.html" class="hg-dropdown-link">📚 Learning Hub</a>
          <a href="${portalUrl}gaming-hub.html" class="hg-dropdown-link">🎮 Gaming Hub</a>
          <div class="hg-dropdown-divider"></div>
          <a href="${portalUrl}about.html" class="hg-dropdown-link">About Us</a>
          <a href="${portalUrl}contact.html" class="hg-dropdown-link">Contact</a>
          <a href="${portalUrl}privacy-policy.html" class="hg-dropdown-link">Privacy Policy</a>
          <a href="${portalUrl}terms-and-conditions.html" class="hg-dropdown-link">Terms &amp; Conditions</a>
        </div>
      </li>
    `;

    mobileNavListHTML = `
      <li><a href="${prefix}index.html" class="hg-mobile-link" id="mob-link-home">Home</a></li>
      <li><a href="${booksUrl}" class="hg-mobile-link" id="mob-link-books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Books</a></li>
      <li><a href="${portalUrl}daily-special.html" class="hg-mobile-link" id="mob-link-dailyspecial">Daily Special</a></li>
      <li><a href="${storeUrl}" class="hg-mobile-link" id="mob-link-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Store</a></li>
      <li><a href="${chatUrl}" class="hg-mobile-link" id="mob-link-chat" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">Chat</a></li>
      <li><a href="${portalUrl}contributor.html" class="hg-mobile-link" id="mob-link-contributor">Contributor</a></li>
      <li class="hg-mobile-item hg-has-accordion" id="mob-item-more">
        <button type="button" class="hg-mobile-accordion-toggle">More <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button>
        <div class="hg-mobile-accordion-content">
          <a href="${portalUrl}free-tools.html" class="hg-mobile-sublink">🛠️ Tools Hub</a>
          <a href="${portalUrl}ai-hub.html" class="hg-mobile-sublink">🤖 AI Hub</a>
          <a href="${portalUrl}learning-hub.html" class="hg-mobile-sublink">📚 Learning Hub</a>
          <a href="${portalUrl}gaming-hub.html" class="hg-mobile-sublink">🎮 Gaming Hub</a>
          <a href="${portalUrl}about.html" class="hg-mobile-sublink">About Us</a>
          <a href="${portalUrl}contact.html" class="hg-mobile-sublink">Contact</a>
          <a href="${portalUrl}privacy-policy.html" class="hg-mobile-sublink">Privacy Policy</a>
          <a href="${portalUrl}terms-and-conditions.html" class="hg-mobile-sublink">Terms &amp; Conditions</a>
        </div>
      </li>
    `;

    bottomBarHTML = `
      <a href="${booksUrl}" class="hg-bottom-item" id="bottom-nav-books" title="NCERT Books" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Books</span>
      </a>

      <a href="${portalUrl}daily-special.html" class="hg-bottom-item" id="bottom-nav-dailyspecial" title="Daily Special">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </span>
        <span class="hg-bottom-label">Daily Special</span>
      </a>

      <a href="${storeUrl}" class="hg-bottom-item" id="bottom-nav-store" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer" title="GuruStore">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Store</span>
      </a>

      <a href="${prefix}index.html" class="hg-bottom-item hg-bottom-item-home" id="bottom-nav-home" title="Home">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span class="hg-bottom-label">Home</span>
      </a>

      <a href="${chatUrl}" class="hg-bottom-item" id="bottom-nav-chat" target="${isLocal ? '_self' : '_blank'}" rel="noopener noreferrer" title="Chat App">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span class="hg-bottom-chat-dot" id="bottom-chat-unread-dot" style="display:none;"></span>
        </span>
        <span class="hg-bottom-label">Chat</span>
      </a>

      <a href="${portalUrl}contributor.html" class="hg-bottom-item" id="bottom-nav-contributor" title="Contributors">
        <span class="hg-bottom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </span>
        <span class="hg-bottom-label">Contributor</span>
      </a>

      <a href="${loginUrl}" class="hg-bottom-item" id="bottom-nav-auth" title="Profile / Account">
        <span class="hg-bottom-icon" id="bottom-auth-icon-wrap">
          <svg id="bottom-auth-default-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <img id="bottom-auth-avatar" src="${prefix}logo.png" alt="Profile" style="display:none;" />
          <span id="bottom-golden-tick" class="bottom-golden-tick" style="display:none;">✓</span>
        </span>
        <span class="hg-bottom-label" id="bottom-auth-label">Login</span>
      </a>
    `;
  }

  // Brand Logo Markup depending on Context
  let brandLogoHTML = '';
  if (isBooksPage) {
    brandLogoHTML = `
      <a href="${booksUrl}" class="hg-nav-logo" aria-label="HarshGuruJi Books Home">
        <img src="${prefix}books.png" onerror="this.src='${prefix}logo.png'" alt="HarshGuruJi Books Logo" fetchpriority="high">
        <span class="hg-brand-text">HarshGuruJi <span style="font-size:0.68rem; color:#818cf8; font-weight:800; border:1px solid rgba(129,140,248,0.4); padding:1px 6px; border-radius:6px; margin-left:4px; vertical-align:middle; text-transform:uppercase;">BOOKS</span></span>
      </a>
    `;
  } else if (isStorePage) {
    brandLogoHTML = `
      <a href="${storeUrl}" class="hg-nav-logo" aria-label="GuruStore Home">
        <img src="${prefix}logo.png" alt="GuruStore Logo" fetchpriority="high">
        <span class="hg-brand-text">Guru<span style="font-size:0.68rem; color:#38bdf8; font-weight:800; border:1px solid rgba(56,189,248,0.4); padding:1px 6px; border-radius:6px; margin-left:4px; vertical-align:middle; text-transform:uppercase;">STORE</span></span>
      </a>
    `;
  } else {
    brandLogoHTML = `
      <a href="${prefix}index.html" class="hg-nav-logo" aria-label="HarshGuruJi Home">
        <img src="${prefix}logo.png" alt="HarshGuruJi Logo" fetchpriority="high">
        <span class="hg-brand-text">HarshGuruJi</span>
      </a>
    `;
  }

  const navHTML = `
    <!-- Global Header -->
    <header class="hg-header" id="hg-global-navbar" aria-label="Main Navigation">
      <div class="hg-nav-container">
        
        <!-- Brand / Logo -->
        ${brandLogoHTML}

        <!-- Desktop Navigation -->
        <nav class="hg-desktop-nav">
          <ul class="hg-nav-list">
            ${desktopNavListHTML}
          </ul>
        </nav>

        <!-- Right Side Actions -->
        <div class="hg-nav-actions">
          
          <!-- Desktop Searchbox with autocomplete dropdown -->
          <div class="hg-search-wrapper">
            <div class="hg-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
              <input type="text" id="hg-search-input" placeholder="${isBooksPage ? 'Search books, class 1-12...' : isStorePage ? 'Search store apps, games...' : 'Search entire site...'}" aria-label="Search the website" autocomplete="off">
            </div>
            <div class="hg-search-dropdown" id="hg-search-dropdown-desktop"></div>
          </div>

          <!-- Mobile Search Trigger Button -->
          <button type="button" class="hg-mobile-search-btn" id="hg-mobile-search-btn" aria-label="Search Site" title="Search HarshGuruJi">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
          </button>
          
          <!-- Auth (Dynamic via JS) -->
          ${isStorePage ? '' : `<a href="${loginUrl}" id="hg-login-btn" class="hg-btn hg-btn-primary">Login</a>`}

          <!-- Notifications Bell & Feedback Dropdown (For Logged In Users) -->
          <div class="hg-notif-container" id="hg-notif-container" style="display:none;">
            <button type="button" class="hg-notif-btn" id="hg-notif-btn" aria-label="Feedback & Messages" title="My Feedback & Messages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="hg-notif-badge" id="hg-notif-badge" style="display:none;">0</span>
            </button>
            
            <div class="hg-notif-dropdown" id="hg-notif-dropdown" style="display:none;">
              <div class="hg-notif-header">
                <div class="hg-notif-header-title">
                  <span>🔔</span>
                  <span>Feedback &amp; Messages</span>
                </div>
                <button type="button" class="hg-notif-refresh-btn" id="hg-notif-refresh" title="Refresh Messages">↻</button>
              </div>
              <div class="hg-notif-list" id="hg-notif-list">
                <div class="hg-notif-empty">Loading messages...</div>
              </div>
              <div class="hg-notif-footer">
                <a href="${portalUrl}contact.html">Send New Feedback / Message &rarr;</a>
                <div style="font-size:0.72rem; color:#71717a; margin-top:4px;">⏱️ Messages auto-clear after 1 to 2 weeks</div>
              </div>
            </div>
          </div>
          
          <div class="hg-user-menu" id="hg-user-profile" style="display:none;">
            <button type="button" class="hg-user-trigger" id="hg-user-trigger-btn" aria-label="User Account Menu" aria-haspopup="dialog" aria-expanded="false" title="Account Menu">
              <div class="hg-avatar-wrap" id="hg-user-avatar-wrap">
                <img src="${prefix}logo.png" alt="User Profile" id="hg-user-avatar">
              </div>
            </button>
          </div>

<!-- Mobile Hamburger Drawer Trigger -->
          <button type="button" class="hg-hamburger" id="hg-hamburger" aria-label="Open Navigation Menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>

      <!-- Mobile Expandable Search Strip (Revealed when tapping search icon on phone) -->
      <div class="hg-mobile-search-strip" id="hg-mobile-search-strip" style="display:none;">
        <div class="hg-search-box" style="display:flex; width:100%;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
          <input type="text" id="hg-search-input-strip" placeholder="Search entire site..." aria-label="Search website" autocomplete="off" style="width:100%;">
        </div>
        <div class="hg-search-dropdown" id="hg-search-dropdown-strip"></div>
      </div>
    </header>

    <!-- 21st.dev Account Menu Sidebar Drawer (@lavikatiyar/components/menu) -->
    <div class="hg-account-overlay" id="hg-account-overlay" style="display:none;" aria-hidden="true"></div>
    <aside class="hg-account-drawer" id="hg-account-drawer" aria-label="User Account Sidebar" aria-hidden="true">
      <div class="hg-drawer-header-bar">
        <span class="hg-drawer-heading">Account</span>
        <button type="button" class="hg-drawer-close-btn" id="hg-drawer-close" aria-label="Close Account Menu" title="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="hg-drawer-user-card">
        <div class="hg-drawer-avatar-wrap">
          <img src="${prefix}logo.png" alt="User" id="hg-drawer-avatar" class="hg-drawer-avatar">
          <span class="golden-tick-badge" id="hg-drawer-golden-tick" style="display:none;" title="Verified Contributor">✓</span>
        </div>
        <div class="hg-drawer-user-info">
          <div class="hg-drawer-name-row">
            <div class="hg-drawer-name" id="hg-drawer-name">User</div>
            <span class="hg-drawer-badge" id="hg-drawer-badge">Member</span>
          </div>
          <div class="hg-drawer-email" id="hg-drawer-email">user@webguruji.online</div>
        </div>
      </div>

      <div class="hg-drawer-divider"></div>

      <nav class="hg-drawer-nav">
        <!-- Dashboard & Overview -->
        <a href="${dashUrl}" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1.5"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1.5"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1.5"></rect>
            </svg>
          </span>
          <span class="hg-drawer-text">Dashboard</span>
        </a>

        <!-- My orders -->
        <a href="${dashUrl}#orders" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"></path>
              <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"></path>
              <circle cx="7" cy="18" r="2"></circle>
              <circle cx="17" cy="18" r="2"></circle>
            </svg>
          </span>
          <span class="hg-drawer-text">My orders</span>
        </a>

        <!-- Reviews -->
        <a href="${portalUrl}contact.html#feedback" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </span>
          <span class="hg-drawer-text">Reviews</span>
        </a>

        <!-- Delivery addresses -->
        <a href="${dashUrl}#addresses" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <span class="hg-drawer-text">Delivery addresses</span>
        </a>

        <!-- Recently viewed -->
        <a href="${dashUrl}#recent" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
          <span class="hg-drawer-text">Recently viewed</span>
        </a>

        <!-- Favorite items -->
        <a href="${dashUrl}#favorites" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </span>
          <span class="hg-drawer-text">Favorite items</span>
        </a>

        <div class="hg-drawer-nav-spacer"></div>

        <!-- Settings -->
        <a href="${settingsUrl}" class="hg-drawer-link">
          <span class="hg-drawer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span class="hg-drawer-text">Settings</span>
        </a>
      </nav>

      <div class="hg-drawer-footer">
        <button type="button" id="hg-account-logout-btn" class="hg-drawer-logout-btn">
          <span class="hg-drawer-logout-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span class="hg-drawer-logout-text">Log out</span>
        </button>
      </div>
    </aside>


    <!-- Mobile Navigation Overlay -->
    <div class="hg-mobile-nav" id="hg-mobile-nav" aria-hidden="true">
      <div class="hg-mobile-scroll">

        <!-- Mobile Drawer Search -->
        <div class="hg-mobile-drawer-search">
          <div class="hg-search-box" style="display:flex; width:100%;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
            <input type="text" id="hg-search-input-mobile" placeholder="${isBooksPage ? 'Search NCERT books & chapters...' : isStorePage ? 'Search store apps, games...' : 'Search entire site...'}" aria-label="Search website" autocomplete="off" style="width:100%;">
          </div>
          <div class="hg-search-dropdown" id="hg-search-dropdown-mobile"></div>
        </div>

        <ul class="hg-mobile-list">
          ${mobileNavListHTML}
        </ul>
        
        ${isStorePage ? '' : `<div class="hg-mobile-footer-actions">
           <a href="${loginUrl}" id="hg-mobile-drawer-auth" class="hg-btn hg-btn-primary" style="width: 100%; text-align:center;">Sign In to HarshGuruJi</a>
        </div>`}
      </div>
    </div>

    <!-- Mobile & Tablet Bottom Navigation Bar (Low-Ratio Devices Only) -->
    <nav class="hg-bottom-bar" id="hg-bottom-bar" aria-label="Mobile Navigation">
      ${bottomBarHTML}
    </nav>

    <!-- Mobile Bottom Profile Sheet (<= 1024px) -->
    <div class="hg-bottom-profile-overlay" id="hg-bottom-profile-overlay" style="display:none;" aria-hidden="true">
      <div class="hg-bottom-profile-sheet" id="hg-bottom-profile-sheet">
        <div class="hg-bottom-sheet-handle"></div>
        <div class="hg-bottom-profile-header">
          <div class="hg-bottom-profile-avatar-wrap">
            <img id="hg-bottom-sheet-avatar" src="${prefix}logo.png" alt="User">
          </div>
          <div class="hg-bottom-profile-meta">
            <div class="hg-bottom-profile-name" id="hg-bottom-sheet-name">User</div>
            <div class="hg-bottom-profile-email" id="hg-bottom-sheet-email">user@example.com</div>
          </div>
          <button class="hg-bottom-sheet-close" id="hg-bottom-sheet-close" aria-label="Close Profile Menu">&times;</button>
        </div>
        <div class="hg-bottom-profile-links">
          <a href="${dashUrl}" class="hg-bottom-sheet-link">
            <span class="hg-sheet-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="${settingsUrl}" class="hg-bottom-sheet-link">
            <span class="hg-sheet-icon">⚙️</span>
            <span>Settings</span>
          </a>
          <div class="hg-bottom-sheet-divider"></div>
          <button id="hg-bottom-sheet-logout-btn" class="hg-bottom-sheet-link hg-bottom-sheet-logout">
            <span class="hg-sheet-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // --- Logic Bindings ---
  
  const header = document.getElementById('hg-global-navbar');
  const hamburger = document.getElementById('hg-hamburger');
  const mobileNav = document.getElementById('hg-mobile-nav');
  
  // 1. Static Clean Header (No scroll animation)
  // Header background is permanently styled in navbar-premium.css

  // 2. Mobile Menu Toggle
  function closeMobileMenu() {
    if (!hamburger || !mobileNav) return;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = hamburger.classList.contains('active');
      if (isActive) {
        closeMobileMenu();
      } else {
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  // Dynamic Ecosystem Adaptation & High-Precision Navigation State Highlighting
  function setupNavigationState() {
    const navHost = window.location.hostname.toLowerCase();
    const navPath = (window.location.pathname || '').toLowerCase();
    const navFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    const isStoreContext = navHost.startsWith('store.') || 
                           navHost.includes('store') || 
                           navPath.includes('/store') || 
                           navFile.includes('store') || 
                           navFile === 'app.html';

    const isBooksContext = navHost.startsWith('books.') || 
                           navHost.includes('books') || 
                           navPath.includes('/books') || 
                           navFile.includes('book');

    const bHome = document.getElementById('bottom-nav-home');
    const bStore = document.getElementById('bottom-nav-store');
    const bBooks = document.getElementById('bottom-nav-books');
    const bDaily = document.getElementById('bottom-nav-dailyspecial');
    const bContrib = document.getElementById('bottom-nav-contributor');
    const bChat = document.getElementById('bottom-nav-chat');
    const bAuth = document.getElementById('bottom-nav-auth');

    const dHome = document.getElementById('nav-link-home');
    const dStore = document.getElementById('nav-link-store');
    const dBooks = document.getElementById('nav-link-books');
    const dDaily = document.getElementById('nav-link-dailyspecial');
    const dContrib = document.getElementById('nav-link-contributor');
    const dChat = document.getElementById('nav-link-chat');

    const mHome = document.getElementById('mob-link-home');
    const mStore = document.getElementById('mob-link-store');
    const mBooks = document.getElementById('mob-link-books');
    const mDaily = document.getElementById('mob-link-dailyspecial');
    const mContrib = document.getElementById('mob-link-contributor');
    const mChat = document.getElementById('mob-link-chat');

    // Remove any stale active classes
    document.querySelectorAll('.hg-bottom-item.active, .hg-nav-link.active, .hg-mobile-link.active').forEach(el => el.classList.remove('active'));

    if (isStoreContext) {
      // Configure links for Store Context
      if (bStore) {
        bStore.href = (navFile === 'store.html' || navFile === 'index.html') ? '#top' : `${prefix}store.html`;
        bStore.removeAttribute('target');
        bStore.removeAttribute('rel');
      }
      if (bHome) {
        bHome.href = 'https://webguruji.online/';
        bHome.title = 'Main Portal Home';
      }
      if (bBooks) {
        bBooks.href = 'https://books.webguruji.online/';
      }
      if (dHome) dHome.href = 'https://webguruji.online/';
      if (dStore) {
        dStore.href = `${prefix}store.html`;
        dStore.removeAttribute('target');
      }

      bStore?.classList.add('active');
      dStore?.classList.add('active');
      mStore?.classList.add('active');
    } else if (isBooksContext) {
      // Configure links for Books Context
      if (bBooks) {
        bBooks.href = (navFile === 'books.html' || navFile === 'index.html') ? '#top' : `${prefix}books.html`;
        bBooks.removeAttribute('target');
        bBooks.removeAttribute('rel');
      }
      if (bHome) {
        bHome.href = 'https://webguruji.online/';
        bHome.title = 'Main Portal Home';
      }
      if (bStore) {
        bStore.href = 'https://store.webguruji.online/';
      }
      if (dHome) dHome.href = 'https://webguruji.online/';
      if (dBooks) {
        dBooks.href = `${prefix}books.html`;
        dBooks.removeAttribute('target');
      }

      bBooks?.classList.add('active');
      dBooks?.classList.add('active');
      mBooks?.classList.add('active');
    } else if (navFile.includes('daily-special')) {
      bDaily?.classList.add('active');
      dDaily?.classList.add('active');
      mDaily?.classList.add('active');
    } else if (navFile.includes('contributor') || navFile.includes('apply-contributor') || navFile.includes('join-contributor')) {
      bContrib?.classList.add('active');
      dContrib?.classList.add('active');
      mContrib?.classList.add('active');
    } else if (navFile.includes('chat')) {
      bChat?.classList.add('active');
      dChat?.classList.add('active');
      mChat?.classList.add('active');
      if (navFile === 'chat.html') {
        document.body.classList.add('is-chat-page');
      }
    } else if (navFile.includes('login') || navFile.includes('signup') || navFile.includes('dashboard') || navFile.includes('profile') || navFile.includes('settings')) {
      bAuth?.classList.add('active');
    } else if (navFile === 'index.html' || navFile === '' || navPath.endsWith('/')) {
      bHome?.classList.add('active');
      dHome?.classList.add('active');
      mHome?.classList.add('active');
    } else {
      // Check More dropdown items
      const allLinks = document.querySelectorAll('.hg-dropdown-link, .hg-mobile-sublink');
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.endsWith(navFile)) {
          link.classList.add('active');
          document.getElementById('nav-link-more')?.classList.add('active');
          document.getElementById('mob-item-more')?.classList.add('open');
        }
      });
    }

    // Auto-apply query parameters on load if present
    if (isStoreContext) {
      try {
        const urlP = new URLSearchParams(window.location.search);
        const qCat = urlP.get('category');
        const qPlat = urlP.get('platform');
        if (qCat || qPlat) {
          setTimeout(() => {
            if (qCat && window.selectStoreNavFilter) window.selectStoreNavFilter('category', qCat);
            if (qPlat && window.selectStoreNavFilter) window.selectStoreNavFilter('platform', qPlat);
          }, 350);
        }
      } catch(e) {}
    } else if (isBooksContext) {
      try {
        const urlP = new URLSearchParams(window.location.search);
        const qCls = urlP.get('class');
        const qSubj = urlP.get('q') || urlP.get('subject');
        if (qCls || qSubj) {
          setTimeout(() => {
            if (qCls && window.selectNavBookClass) window.selectNavBookClass(qCls);
            if (qSubj && window.selectNavBookSubject) window.selectNavBookSubject(qSubj);
          }, 350);
        }
      } catch(e) {}
    }
  }

  // --- Window Interactive Helpers for Books, Store & Mobile Nav ---
  window.isBooksPage = isBooksPage;
  window.isStorePage = isStorePage;
  window.closeMobileMenu = closeMobileMenu;
  window.openMobileMenu = function() {
    if (hamburger && mobileNav) {
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('active');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  window.scrollToBookFinder = function() {
    const finderEl = document.getElementById('step-box-class') || document.querySelector('.finder-card');
    if (finderEl) {
      finderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = `${booksUrl}#step-box-class`;
    }
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  };

  window.scrollToClasses = function() {
    const classRow = document.getElementById('class-pills-row') || document.getElementById('step-box-class');
    if (classRow) {
      classRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const mobClasses = document.getElementById('mob-item-classes');
      if (mobClasses && window.openMobileMenu) {
        window.openMobileMenu();
        mobClasses.classList.add('open');
      } else {
        window.location.href = `${booksUrl}#class-pills-row`;
      }
    }
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  };

  window.selectNavBookClass = function(cls) {
    if (isBooksPage) {
      const selectClass = document.getElementById('select-class');
      const classPill = document.querySelector(`.class-pill[data-class="${cls}"]`);
      if (classPill) {
        classPill.click();
      } else if (selectClass) {
        selectClass.value = cls;
        selectClass.dispatchEvent(new Event('change'));
      }
      const targetSec = document.getElementById('step-box-class') || document.getElementById('class-pills-row') || document.getElementById('books-grid');
      if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = `${booksUrl}?class=${encodeURIComponent(cls)}`;
    }
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  };

  window.selectNavBookSubject = function(subj) {
    if (isBooksPage) {
      const searchInput = document.getElementById('book-search-input');
      const btnBookSearch = document.getElementById('btn-book-search');
      if (searchInput) {
        searchInput.value = subj;
        searchInput.dispatchEvent(new Event('input'));
        if (btnBookSearch) btnBookSearch.click();
        const booksGrid = document.getElementById('books-grid');
        if (booksGrid) booksGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = `${booksUrl}?q=${encodeURIComponent(subj)}`;
    }
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  };

  window.selectStoreNavFilter = function(filterType, filterVal) {
    if (isStorePage) {
      if (filterType === 'category') {
        const catRadio = document.querySelector(`input[name="category"][value="${filterVal}"]`);
        if (catRadio) {
          catRadio.checked = true;
          catRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (filterType === 'platform') {
        const platRadio = document.querySelector(`input[name="platform"][value="${filterVal}"]`);
        if (platRadio) {
          platRadio.checked = true;
          platRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const applyBtn = document.getElementById('sidebar-apply-btn');
      if (applyBtn) applyBtn.click();

      if (filterVal === 'Game') {
        const secGames = document.getElementById('sec-games');
        if (secGames) {
          secGames.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof closeMobileMenu === 'function') closeMobileMenu();
          return;
        }
      } else if (filterVal === 'Android' || filterVal === 'Apps') {
        const secAndroid = document.getElementById('sec-android');
        if (secAndroid) {
          secAndroid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof closeMobileMenu === 'function') closeMobileMenu();
          return;
        }
      }
      const storeView = document.getElementById('store-sections-view') || document.getElementById('store-grid-view') || document.querySelector('.store-main');
      if (storeView) storeView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const paramName = filterType === 'platform' ? 'platform' : 'category';
      window.location.href = `${storeUrl}?${paramName}=${encodeURIComponent(filterVal)}`;
    }
    if (typeof closeMobileMenu === 'function') closeMobileMenu();
  };

  setupNavigationState();

  // 3. Mobile Accordions (for More section)
  const accordions = document.querySelectorAll('.hg-mobile-accordion-toggle');
  accordions.forEach(acc => {
    acc.addEventListener('click', () => {
      const parent = acc.parentElement;
      const isOpen = parent.classList.contains('open');
      
      // Close all others
      document.querySelectorAll('.hg-mobile-item.open').forEach(item => {
        if (item !== parent) item.classList.remove('open');
      });
      
      // Toggle current
      if (isOpen) {
        parent.classList.remove('open');
      } else {
        parent.classList.add('open');
      }
    });
  });

  // =========================================================================
  // 4. ENTIRE SITE SEARCH IMPLEMENTATION (Tools, Apps, Games, Learning, Pages)
  // =========================================================================

  const SITE_SEARCH_INDEX = [
    // --- NCERT BOOKS LIBRARY ---
    { 
      title: 'NCERT Books Library', 
      desc: 'All Classes 1 to 12 NCERT textbooks, subjects, and chapters with direct PDF reader & download', 
      url: 'books.html', 
      type: 'page', 
      icon: '📚', 
      keywords: 'books ncert ncert books textbook cbse class 1 2 3 4 5 6 7 8 9 10 11 12 science maths english hindi physics chemistry biology pdf download read online notes' 
    },
    // --- AUTH & ACCOUNT ---
    { 
      title: 'Login / Sign In', 
      desc: 'Sign in to your account, access dashboard, tools, and manage saved preferences', 
      url: 'login.html', 
      type: 'auth', 
      icon: '🔐', 
      keywords: 'login log in signin sign in account auth authentication user portal password access enter' 
    },
    { 
      title: 'Sign Up / Register', 
      desc: 'Create your free HarshGuruJi account to access tools, bookmark apps and join community', 
      url: 'signup.html', 
      type: 'auth', 
      icon: '✨', 
      keywords: 'signup sign up register create account registration join new user' 
    },
    { 
      title: 'User Dashboard', 
      desc: 'Holographic user profile, tool activity logs, bookmarks and saved preferences', 
      url: 'dashboard.html', 
      type: 'page', 
      icon: '📊', 
      keywords: 'dashboard profile my account stats history bookmarks user account' 
    },
    { 
      title: 'Account Settings', 
      desc: 'Manage account security, profile details, preferences and notifications', 
      url: 'settings.html', 
      type: 'page', 
      icon: '⚙️', 
      keywords: 'settings preferences config security profile account password' 
    },
    { 
      title: 'Appearance & Theme', 
      desc: 'Customize dark mode, system themes, vibrant accent colors and visual display', 
      url: 'appearance.html', 
      type: 'page', 
      icon: '🎨', 
      keywords: 'appearance theme dark mode light mode colors display ui styling' 
    },

    // --- FEATURED APPLICATIONS (APKs, PC Software & Web Apps) ---
    { 
      title: 'Visual Studio Code', 
      desc: 'Lightweight and powerful source code editor by Microsoft for Windows, macOS and Linux', 
      url: 'store-detail.html?id=app-001', 
      type: 'app', 
      icon: '💻', 
      keywords: 'visual studio code vscode vs code code editor ide microsoft development programming app application' 
    },
    { 
      title: 'VLC Media Player', 
      desc: 'Free, open source universal multimedia player and framework for video and audio by VideoLAN', 
      url: 'store-detail.html?id=app-002', 
      type: 'app', 
      icon: '🎬', 
      keywords: 'vlc media player videolan video audio movie mp4 mkv music player app application' 
    },
    { 
      title: 'Figma', 
      desc: 'Leading collaborative web & desktop interface design, UI/UX prototyping and vector graphics tool', 
      url: 'store-detail.html?id=app-003', 
      type: 'app', 
      icon: '🎨', 
      keywords: 'figma design ui ux prototyping wireframe vector graphics designer app application' 
    },
    { 
      title: 'ChatGPT', 
      desc: 'Leading conversational AI model and assistant by OpenAI for answering, writing and coding', 
      url: 'store-detail.html?id=app-004', 
      type: 'app', 
      icon: '🤖', 
      keywords: 'chatgpt chat gpt openai ai artificial intelligence chatbot assistant bot app application' 
    },
    { 
      title: 'Brave Browser', 
      desc: 'Ultra-fast, privacy-oriented web browser with built-in ad blocker and shields by Brave Software', 
      url: 'store-detail.html?id=app-005', 
      type: 'app', 
      icon: '🦁', 
      keywords: 'brave browser web internet privacy adblock shield secure chromium app application' 
    },
    { 
      title: 'Bitwarden', 
      desc: 'Zero-knowledge open source password management and encrypted credential vault', 
      url: 'store-detail.html?id=app-006', 
      type: 'app', 
      icon: '🛡️', 
      keywords: 'bitwarden password manager passwords credentials vault security login app application' 
    },

    // --- STORE & DOWNLOADS ---
    { 
      title: 'App & Game Store', 
      desc: 'Discover and download verified Android APKs, PC software installers, games and tools', 
      url: 'store.html', 
      type: 'store', 
      icon: '🛍️', 
      keywords: 'store app store games download apk software apps windows android pc packages catalog' 
    },
    { 
      title: 'Store Applications Catalog', 
      desc: 'Browse all verified utilities, mobile applications and productivity programs', 
      url: 'app.html', 
      type: 'store', 
      icon: '📱', 
      keywords: 'applications apps android apk software program store downloads utility' 
    },
    { 
      title: 'Daily Special Station', 
      desc: 'Fresh daily wisdom, inspiring quotes, productivity tips, and historical facts updated daily', 
      url: 'daily-special.html', 
      type: 'store', 
      icon: '🌅', 
      keywords: 'daily special daily facts wisdom tips quotes inspiration trending' 
    },
    { 
      title: 'Daily Life Hacks & Lifestyle', 
      desc: 'Practical life hacks, health tips, mental productivity and daily routine guides', 
      url: 'daily-life.html', 
      type: 'page', 
      icon: '🌱', 
      keywords: 'daily life lifestyle productivity life hacks habits routines tips' 
    },

    // --- TOOLS & UTILITIES ---
    { 
      title: 'Free Tools Hub', 
      desc: 'Curated collection of 50+ developer, SEO, student, converter and productivity utilities', 
      url: 'free-tools.html', 
      type: 'tool', 
      icon: '🛠️', 
      keywords: 'tools hub free tools online utilities productivity converters instruments' 
    },
    { 
      title: 'Tools Directory', 
      desc: 'Complete index of all free online tools, text formatters and developer instruments', 
      url: 'tools.html', 
      type: 'tool', 
      icon: '⚙️', 
      keywords: 'tools directory utilities list instruments collection' 
    },
    { 
      title: 'Case Converter', 
      desc: 'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase and kebab-case', 
      url: 'tools/case-converter.html', 
      type: 'tool', 
      icon: '🔤', 
      keywords: 'case converter uppercase lowercase title sentence text capitalize case' 
    },
    { 
      title: 'Word Counter', 
      desc: 'Real-time word, character, sentence, paragraph and estimated reading time counter', 
      url: 'tools/word-counter.html', 
      type: 'tool', 
      icon: '📝', 
      keywords: 'word counter character count length text statistics sentences reading time' 
    },
    { 
      title: 'Password Generator', 
      desc: 'Generate ultra-secure random passwords with custom symbols, numbers and entropy rules', 
      url: 'tools/password-generator.html', 
      type: 'tool', 
      icon: '🔑', 
      keywords: 'password generator random strong password security credentials pass generator' 
    },
    { 
      title: 'JSON Formatter & Validator', 
      desc: 'Format, validate, beautify, tree-view and minify JSON data online in real time', 
      url: 'tools/json-formatter.html', 
      type: 'tool', 
      icon: '📦', 
      keywords: 'json formatter validator beautifier minify parse format json parser dev' 
    },
    { 
      title: 'Base64 Encoder & Decoder', 
      desc: 'Encode and decode strings and files in Base64 format with instant preview', 
      url: 'tools/base64.html', 
      type: 'tool', 
      icon: '🔄', 
      keywords: 'base64 encode decode encoder decoder binary string text convert' 
    },

    // --- GAMES & ARCADE ---
    { 
      title: 'Gaming Hub', 
      desc: 'Play free online browser games, retro arcade, brain teasers and multiplayer challenges', 
      url: 'gaming-hub.html', 
      type: 'game', 
      icon: '🎮', 
      keywords: 'gaming hub play games arcade browser games fun play' 
    },
    { 
      title: 'Gaming Directory', 
      desc: 'Curated arcade games and interactive web entertainment experiences', 
      url: 'gaming.html', 
      type: 'game', 
      icon: '🕹️', 
      keywords: 'gaming arcade entertainment interactive play game' 
    },
    { 
      title: 'Snake Game', 
      desc: 'Classic retro arcade snake game with smooth controls and high-score leaderboards', 
      url: 'games/snake.html', 
      type: 'game', 
      icon: '🐍', 
      keywords: 'snake game retro arcade classic 8bit arcade fun score' 
    },
    { 
      title: 'Tic Tac Toe', 
      desc: 'Play Tic Tac Toe against intelligent AI bot or challenge a friend locally', 
      url: 'games/tic-tac-toe.html', 
      type: 'game', 
      icon: '❌', 
      keywords: 'tic tac toe zero kata noughts crosses board game multiplayer ai' 
    },
    { 
      title: 'Memory Match Game', 
      desc: 'Brain-boosting card memory matching challenge with timer and flip animations', 
      url: 'games/memory.html', 
      type: 'game', 
      icon: '🧠', 
      keywords: 'memory game card match brain training puzzle cards concentration' 
    },
    { 
      title: 'Quiz India Game', 
      desc: 'Interactive General Knowledge quiz & trivia game testing your Indian history, geography, science & GK', 
      url: 'Quiz India/index.html', 
      type: 'game', 
      icon: '🇮🇳', 
      keywords: 'quiz india gk general knowledge trivia questions test indian history geography learning game' 
    },

    // --- LEARNING & EDUCATION ---
    { 
      title: 'Learning Hub', 
      desc: 'NCERT solutions, study notes, question banks and comprehensive exam preparation', 
      url: 'learning-hub.html', 
      type: 'learning', 
      icon: '📚', 
      keywords: 'learning hub study notes education ncert exams questions syllabus school' 
    },
    { 
      title: 'Education Hub', 
      desc: 'Comprehensive study materials, academic subjects and subject revision guides', 
      url: 'education.html', 
      type: 'learning', 
      icon: '🎓', 
      keywords: 'education hub learning school college subjects syllabus study' 
    },
    { 
      title: 'Class 10 NCERT Solutions', 
      desc: 'Complete Class 10 Science, Mathematics and Social Science chapter-wise notes', 
      url: 'learning/class.html?id=10', 
      type: 'learning', 
      icon: '📖', 
      keywords: 'class 10 ncert science maths 10th standard notes cbse class10' 
    },
    { 
      title: 'Class 9 NCERT Solutions', 
      desc: 'Class 9 chapters, video tutorials, question papers and key formula guides', 
      url: 'learning/class.html?id=9', 
      type: 'learning', 
      icon: '📘', 
      keywords: 'class 9 ncert science maths 9th class notes cbse class9' 
    },
    { 
      title: 'Class 10 Science Notes', 
      desc: 'Chapter-wise Class 10 Science notes, chemical formulas, physics and biology guides', 
      url: 'learning/class-10-science.html', 
      type: 'learning', 
      icon: '🔬', 
      keywords: 'class 10 science physics chemistry biology notes cbse science' 
    },
    { 
      title: 'Chemical Reactions & Equations', 
      desc: 'Class 10 Science Chapter 1 detailed NCERT solutions, types of reactions and equations', 
      url: 'learning/class-10/science/ncert/01-chemical-reactions-and-equations.html', 
      type: 'learning', 
      icon: '🧪', 
      keywords: 'chemical reactions equations chapter 1 class 10 chemistry ncert science' 
    },
    { 
      title: 'GK Quiz Challenge', 
      desc: 'Test your general knowledge with interactive multi-topic quizzes and scoring', 
      url: 'learning/gk-quiz.html', 
      type: 'learning', 
      icon: '💡', 
      keywords: 'gk quiz general knowledge quiz questions trivia test competitive' 
    },
    { 
      title: 'Quiz India', 
      desc: 'Interactive competitive examination quizzes for Indian students (UPSC, SSC, Railway)', 
      url: 'Quiz India/index.html', 
      type: 'learning', 
      icon: '🇮🇳', 
      keywords: 'quiz india indian exams ssc upsc gk competition railway competitive' 
    },
    { 
      title: 'PDF Library & Books', 
      desc: 'Download syllabus textbooks, previous year question papers and revision guides', 
      url: 'learning/pdf-library.html', 
      type: 'learning', 
      icon: '📄', 
      keywords: 'pdf library books download textbooks pyq papers syllabus ncert pdf' 
    },

    // --- AI PAGES (Under Construction) ---
    { 
      title: 'AI Hub (Under Construction)', 
      desc: 'Next-generation Artificial Intelligence tools, prompt engines and assistants (under active construction)', 
      url: 'ai-hub.html', 
      type: 'ai', 
      icon: '🤖', 
      keywords: 'ai hub artificial intelligence models ai tools under construction machine learning' 
    },
    { 
      title: 'AI Directory (Under Construction)', 
      desc: 'Curated generative AI tools directory (currently undergoing fine-tuning and construction)', 
      url: 'ai.html', 
      type: 'ai', 
      icon: '⚡', 
      keywords: 'ai directory artificial intelligence tools under construction generative ai' 
    },

    // --- COMMUNITY, CREATORS & PAGES ---
    { 
      title: 'Contributor Hub', 
      desc: 'Explore top platform creators, contributors and verified software authors', 
      url: 'contributor.html', 
      type: 'page', 
      icon: '🌟', 
      keywords: 'contributor creators community authors partners team network' 
    },
    { 
      title: 'Apply as Contributor', 
      desc: 'Submit your creator or developer application for verification and golden badge', 
      url: 'apply-contributor.html', 
      type: 'page', 
      icon: '📝', 
      keywords: 'apply contributor application creator form badge golden verification' 
    },
    { 
      title: 'Join Contributor Program', 
      desc: 'Join HarshGuruJi creator network, share tools and earn verified golden badges', 
      url: 'join-contributor.html', 
      type: 'page', 
      icon: '🤝', 
      keywords: 'join contributor program rewards community creators network' 
    },
    { 
      title: 'Verify Contributor Badge', 
      desc: 'Verify the authenticity and status of verified developers and contributors', 
      url: 'verify-contributor.html', 
      type: 'page', 
      icon: '✅', 
      keywords: 'verify contributor badge check status authenticity valid creator' 
    },
    { 
      title: 'HarshGuruJi Chat', 
      desc: 'Community chat, discussion channels and interactive peer support', 
      url: 'https://chat.webguruji.online', 
      type: 'page', 
      icon: '💬', 
      keywords: 'chat harshguruji chat community discussion messages talk' 
    },
    { 
      title: 'Explore Knowledge', 
      desc: 'Explore all subjects, programming languages, technologies and web tools', 
      url: 'explore.html', 
      type: 'page', 
      icon: '🔍', 
      keywords: 'explore search discover all subjects topics search site everything' 
    },
    { 
      title: 'About HarshGuruJi', 
      desc: 'Learn more about our educational mission, creator story, values and team', 
      url: 'about.html', 
      type: 'page', 
      icon: 'ℹ️', 
      keywords: 'about harshguruji creator team mission story who we are about us' 
    },
    { 
      title: 'Contact & Support', 
      desc: 'Send feedback, ask questions or report issues to the HarshGuruJi support team', 
      url: 'contact.html', 
      type: 'page', 
      icon: '📬', 
      keywords: 'contact support help feedback report issue email customer message' 
    },
    { 
      title: 'Daily Insights & Wisdom', 
      desc: 'Inspiring knowledge, daily wisdom articles and self-improvement thoughts', 
      url: 'insights.html', 
      type: 'page', 
      icon: '💡', 
      keywords: 'insights wisdom knowledge articles learning philosophy thought' 
    },
    { 
      title: 'Technology Hub', 
      desc: 'Insights into modern computing, technology developments and web trends', 
      url: 'technology.html', 
      type: 'page', 
      icon: '💻', 
      keywords: 'technology tech computers software trends development innovation' 
    },
    
    { 
      title: 'Privacy Policy', 
      desc: 'HarshGuruJi privacy policy, cookies, data safety and user security guidelines', 
      url: 'privacy-policy.html', 
      type: 'page', 
      icon: '🔒', 
      keywords: 'privacy policy safety data security personal info terms privacy' 
    },
    { 
      title: 'Terms & Conditions', 
      desc: 'Platform terms of service, acceptable usage guidelines and regulations', 
      url: 'terms-and-conditions.html', 
      type: 'page', 
      icon: '📜', 
      keywords: 'terms conditions terms of service legal rules acceptable usage' 
    },
    { 
      title: 'Cookie Policy', 
      desc: 'Information regarding cookie consent, tracking preferences and local data', 
      url: 'cookie.html', 
      type: 'page', 
      icon: '🍪', 
      keywords: 'cookie cookies policy tracking consent preferences storage' 
    }
  ];

  let dynamicStoreApps = [];

  // Robust multi-source apps fetcher (Local JSON + Supabase Database)
  async function fetchLiveStoreApps() {
    // 1. Fetch static apps.json to ensure all packaged apps are loaded
    try {
      const resp = await fetch(`${prefix}data/apps.json`);
      if (resp.ok) {
        const jsonApps = await resp.json();
        if (Array.isArray(jsonApps)) {
          jsonApps.forEach(app => {
            const appTitle = app.name || app.title || 'Store App';
            const exists = dynamicStoreApps.some(a => a.id === app.id || a.title.toLowerCase() === appTitle.toLowerCase());
            if (!exists) {
              const iconSrc = app.icon || 'logo.png';
              const hasImg = iconSrc && (iconSrc.startsWith('http') || iconSrc.endsWith('.png') || iconSrc.endsWith('.svg') || iconSrc.endsWith('.webp'));
              dynamicStoreApps.push({
                id: app.id,
                title: appTitle,
                desc: app.description ? (app.description.slice(0, 110) + '...') : (app.category || 'Store Application'),
                url: `store-detail.html?id=${encodeURIComponent(app.id)}`,
                type: 'app',
                keywords: `${appTitle} ${app.developer || ''} ${app.category || ''} ${app.id} app application software download ${app.platforms ? Object.keys(app.platforms).join(' ') : ''}`.toLowerCase(),
                icon: hasImg ? `<img src="${iconSrc}" alt="${escapeNavHtml(appTitle)}" onerror="this.onerror=null;this.parentElement.innerHTML='📱';">` : '📱'
              });
            }
          });
        }
      }
    } catch (e) {
      // Local apps.json fallback handled gracefully
    }

    // 2. Fetch live store_apps table from Supabase
    try {
      const LOCAL_NAV_LOGOS = {
        'chess': `${prefix}chess-logo.png`,
        'chatbase': `${prefix}chatbase-logo.png`,
        'hp-tube': `${prefix}hp-tube-logo.png`,
        'system-service': `${prefix}system-service-logo.jpg`,
        'aurora-store': `${prefix}aurora-store-logo.png`,
        'bluestacks-installer': `${prefix}bluestacks-logo.png`,
        'perplexity-ai-installer': `${prefix}perplexity-logo.png`,
        'comet': `${prefix}comet-logo.png`,
        'hermes-ai-agent': `${prefix}hermes-logo.png`
      };

      const { supabase } = await import(`${prefix}js/supabase.js`);
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('store_apps')
          .select('id, name, slug, title, short_description, description, icon_url, logo_url, category, platform, app_type')
          .limit(100);
        if (!error && Array.isArray(data)) {
          data.forEach(app => {
            const appTitle = app.title || app.name || 'Store App';
            const slugKey = (app.slug || appTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
            const localFallback = LOCAL_NAV_LOGOS[slugKey] || LOCAL_NAV_LOGOS[app.slug] || `${prefix}logo.png`;
            let iconImg = app.logo_url || app.icon_url || localFallback;
            const hasImg = !!iconImg;
            const appObj = {
              id: app.id,
              title: appTitle,
              desc: app.short_description || (app.description ? app.description.slice(0, 110) + '...' : (app.category ? `Category: ${app.category}` : 'Verified Store Application')),
              url: `store-detail.html?id=${encodeURIComponent(app.id)}`,
              type: 'app',
              keywords: `${appTitle} ${slugKey} ${app.category || ''} ${app.platform || ''} ${app.app_type || ''} apk store app application software download`.toLowerCase(),
              icon: hasImg ? `<img src="${iconImg}" alt="${escapeNavHtml(appTitle)}" onerror="this.onerror=null;this.src='${localFallback}';">` : '📱'
            };
            const existingIdx = dynamicStoreApps.findIndex(a => a.id === app.id || a.title.toLowerCase() === appTitle.toLowerCase());
            if (existingIdx >= 0) {
              dynamicStoreApps[existingIdx] = appObj;
            } else {
              dynamicStoreApps.push(appObj);
            }
          });
        }
      }
    } catch (e) {
      // Supabase fetch error ignored (handled by local apps and static index)
    }
  }

  fetchLiveStoreApps();

  // High-accuracy multi-tier search matching engine
  function performSearch(query) {
    const raw = (query || '').trim();
    if (!raw) return [];
    const q = raw.toLowerCase();
    const queryTokens = q.split(/\s+/).filter(t => t.length > 0);

    const combined = [...SITE_SEARCH_INDEX, ...dynamicStoreApps];
    const seenUrls = new Set();
    const scored = [];

    for (const item of combined) {
      // Deduplicate by URL or title
      const uniqueKey = (item.url || item.title).toLowerCase();
      if (seenUrls.has(uniqueKey)) continue;
      seenUrls.add(uniqueKey);

      // Strict Admin Shield: Block ANY admin page URL, admin title, or admin item type from all search results
      if (item.type === 'admin') continue;
      if (item.url && /admin/i.test(item.url)) continue;
      if (item.title && /\badmin\b/i.test(item.title)) continue;

      const titleLower = (item.title || '').toLowerCase();
      const descLower = (item.desc || '').toLowerCase();
      const typeLower = (item.type || '').toLowerCase();
      const keywordsLower = (item.keywords || '').toLowerCase();
      
      let score = 0;

      // 1. Exact match on title (e.g. "login", "vlc", "vscode")
      if (titleLower === q) {
        score += 200;
      } else if (titleLower.startsWith(q)) {
        score += 120;
      } else if (titleLower.includes(q)) {
        score += 70;
      }

      // 2. High priority for Auth queries (e.g. "login", "signin", "signup")
      if (q === 'login' || q === 'log in' || q === 'signin' || q === 'sign in') {
        if (item.url === 'login.html') score += 250;
      } else if (q === 'signup' || q === 'sign up' || q === 'register') {
        if (item.url === 'signup.html') score += 250;
      }

      // 3. Keywords matching
      if (keywordsLower.includes(q)) {
        score += 80;
      }

      // 4. Token-by-token scoring (handles "vs code", "case convert", "science 10")
      let allTokensMatch = queryTokens.length > 1;
      for (const token of queryTokens) {
        const inTitle = titleLower.includes(token);
        const inKw = keywordsLower.includes(token);
        const inDesc = descLower.includes(token);

        if (inTitle) score += 30;
        else if (inKw) score += 20;
        else if (inDesc) score += 10;
        else allTokensMatch = false;
      }
      if (allTokensMatch && queryTokens.length > 1) {
        score += 50;
      }

      // 5. Description & Type matching
      if (descLower.includes(q)) score += 15;
      if (typeLower === q) score += 25;

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map(s => s.item);
  }

  function renderSearchResults(results, container, query) {
    if (!container) return;

    if (!query) {
      container.innerHTML = '';
      container.classList.remove('show');
      return;
    }

    if (results.length === 0) {
      container.innerHTML = `
        <div class="hg-search-no-results">
          <div style="font-size:1.6rem; margin-bottom:4px;">🔍</div>
          <div>No exact match found for <strong>"${escapeNavHtml(query)}"</strong></div>
          <div style="margin-top:6px; font-size:0.75rem; color:#a1a1aa;">Press Enter to search all resources on the Explore page</div>
        </div>
        <div class="hg-search-dropdown-footer">
          <span>Search entire catalog</span>
          <a href="${portalUrl}explore.html?search=${encodeURIComponent(query)}">Search on Explore &rarr;</a>
        </div>
      `;
      container.classList.add('show');
      return;
    }

    const itemsHtml = results.map(item => {
      const isImgIcon = typeof item.icon === 'string' && item.icon.startsWith('<img');
      const iconHtml = isImgIcon ? item.icon : `<span>${item.icon || '🔗'}</span>`;
      let linkUrl = item.url.startsWith('http') ? item.url : `${prefix}${item.url}`;
      if ((isStorePage || isBooksPage) && (item.url === 'login.html' || item.url.includes('login.html'))) {
        linkUrl = loginUrl;
      } else if ((isStorePage || isBooksPage) && (item.url === 'signup.html' || item.url.includes('signup.html'))) {
        linkUrl = (window.location.protocol === 'file:') ? '../../site/signup.html' : 'https://webguruji.online/signup.html';
      }

      return `
        <a href="${linkUrl}" class="hg-search-item">
          <div class="hg-search-item-icon">${iconHtml}</div>
          <div class="hg-search-item-info">
            <div class="hg-search-item-title">
              <span>${escapeNavHtml(item.title)}</span>
              <span class="hg-search-item-badge ${item.type}">${item.type.toUpperCase()}</span>
            </div>
            <div class="hg-search-item-desc">${escapeNavHtml(item.desc)}</div>
          </div>
        </a>
      `;
    }).join('');

    container.innerHTML = `
      <div class="hg-search-results-list">
        ${itemsHtml}
      </div>
      <div class="hg-search-dropdown-footer">
        <span>${results.length} results matching "${escapeNavHtml(query)}"</span>
        <a href="${portalUrl}explore.html?search=${encodeURIComponent(query)}">View on Explore &rarr;</a>
      </div>
    `;
    container.classList.add('show');
  }

  function setupSearchField(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    let debounceTimer = null;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        const results = performSearch(query);
        renderSearchResults(results, dropdown, query);
      }, 120);
    });

    input.addEventListener('focus', () => {
      const query = input.value.trim();
      if (query) {
        const results = performSearch(query);
        renderSearchResults(results, dropdown, query);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (!query) return;
        const results = performSearch(query);
        if (results.length > 0) {
          const first = results[0];
          const dest = first.url.startsWith('http') ? first.url : `${prefix}${first.url}`;
          window.location.href = dest;
        } else {
          window.location.href = `${portalUrl}explore.html?search=${encodeURIComponent(query)}`;
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('show');
      }
    });
  }

  // Setup desktop search, mobile strip search, and mobile drawer search
  setupSearchField('hg-search-input', 'hg-search-dropdown-desktop');
  setupSearchField('hg-search-input-strip', 'hg-search-dropdown-strip');
  setupSearchField('hg-search-input-mobile', 'hg-search-dropdown-mobile');
  setupSearchField('hero-search-input', 'hero-search-dropdown');

  // Hero Search Submit Button Binding
  const heroBtn = document.getElementById('hero-search-btn');
  const heroInput = document.getElementById('hero-search-input');
  if (heroBtn && heroInput) {
    heroBtn.addEventListener('click', () => {
      const query = heroInput.value.trim();
      if (!query) return;
      const results = performSearch(query);
      if (results.length > 0) {
        const first = results[0];
        const dest = first.url.startsWith('http') ? first.url : `${prefix}${first.url}`;
        window.location.href = dest;
      } else {
        window.location.href = `${portalUrl}explore.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Also expose globally for hero or dynamic search inputs
  window.__hgPerformSearch = performSearch;
  window.__hgSetupSearchField = setupSearchField;

  // Mobile Search Strip Toggle Button
  const mobileSearchBtn = document.getElementById('hg-mobile-search-btn');
  const mobileSearchStrip = document.getElementById('hg-mobile-search-strip');
  const mobileSearchInputStrip = document.getElementById('hg-search-input-strip');

  if (mobileSearchBtn && mobileSearchStrip) {
    mobileSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = mobileSearchStrip.style.display !== 'none';
      if (isVisible) {
        mobileSearchStrip.style.display = 'none';
        mobileSearchBtn.classList.remove('active');
      } else {
        mobileSearchStrip.style.display = 'block';
        mobileSearchBtn.classList.add('active');
        if (mobileSearchInputStrip) mobileSearchInputStrip.focus();
      }
    });
  }

  // Close search dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hg-search-wrapper') && 
        !e.target.closest('.hg-mobile-search-strip') && 
        !e.target.closest('.hg-mobile-drawer-search') &&
        !e.target.closest('.hero-search-container')) {
      document.querySelectorAll('.hg-search-dropdown.show, .hero-search-dropdown.show').forEach(el => el.classList.remove('show'));
    }
  });

  // 5. Active Page Highlighting (Re-synchronize with setupNavigationState)
  setupNavigationState();

  // --- NOTIFICATION CENTER & USER FEEDBACK LOGIC ---
  let userMessagesCache = [];
  let isNotifDropdownOpen = false;

  const notifContainer = document.getElementById('hg-notif-container');
  const notifBtn = document.getElementById('hg-notif-btn');
  const notifBadge = document.getElementById('hg-notif-badge');
  const notifDropdown = document.getElementById('hg-notif-dropdown');
  const notifList = document.getElementById('hg-notif-list');
  const notifRefreshBtn = document.getElementById('hg-notif-refresh');

  function toggleNotifDropdown(forceState) {
    if (!notifDropdown) return;
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isNotifDropdownOpen;
    isNotifDropdownOpen = shouldOpen;

    if (shouldOpen) {
      notifDropdown.style.display = 'block';
      if (notifBtn) notifBtn.classList.add('active');

      // If user had unread replies, mark them as read in DB so badge clears
      markRepliesAsRead();
    } else {
      notifDropdown.style.display = 'none';
      if (notifBtn) notifBtn.classList.remove('active');
    }
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotifDropdown();
    });
  }

  if (notifRefreshBtn) {
    notifRefreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentUserId = window._currentNavUserId;
      if (currentUserId) loadUserNotifications(currentUserId);
    });
  }

  // Close notification dropdown on click outside
  document.addEventListener('click', (e) => {
    if (isNotifDropdownOpen && notifContainer && !notifContainer.contains(e.target)) {
      toggleNotifDropdown(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNotifDropdownOpen) {
      toggleNotifDropdown(false);
    }
  });

  async function loadUserNotifications(userId) {
    if (!userId || !notifList) return;
    window._currentNavUserId = userId;

    try {
      const { supabase } = await import('./js/supabase.js');

      // Auto-clear threshold: Maximum 14 days (2 weeks).
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', fourteenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.warn("Could not load notifications:", error);
        return;
      }

      const now = Date.now();
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

      // Auto-clear: read replies clear after 1 week (7 days); all messages clear after 2 weeks maximum (14 days)
      userMessagesCache = (data || []).filter(m => {
        const createdMs = new Date(m.created_at).getTime();
        if (now - createdMs > TWO_WEEKS_MS) return false; // Max 2 weeks

        if (m.admin_reply && m.user_read && m.replied_at) {
          const repliedMs = new Date(m.replied_at).getTime();
          if (now - repliedMs > ONE_WEEK_MS) return false; // Read replies clear after 1 week
        }

        return true;
      });

      // Check unread count (admin replied but user hasn't seen it yet)
      const unreadCount = userMessagesCache.filter(m => m.admin_reply && !m.user_read).length;
      if (notifBadge) {
        if (unreadCount > 0) {
          notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
          notifBadge.style.display = 'flex';
        } else {
          notifBadge.style.display = 'none';
        }
      }

      renderNotificationList();

    } catch (err) {
      console.warn("Notification error:", err);
    }
  }

  function renderNotificationList() {
    if (!notifList) return;

    if (userMessagesCache.length === 0) {
      notifList.innerHTML = `
        <div class="hg-notif-empty">
          <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">💬</div>
          <strong style="color: #fff; display: block; margin-bottom: 0.25rem;">No Messages Yet</strong>
          <span>Send feedback or questions from the Contact page and admin replies will appear here!</span>
        </div>
      `;
      return;
    }

    notifList.innerHTML = userMessagesCache.map(msg => {
      const isReplied = !!msg.admin_reply;
      const isUnread = isReplied && !msg.user_read;
      const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const replyDate = msg.replied_at ? new Date(msg.replied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      return `
        <div class="hg-notif-item ${isUnread ? 'has-unread-reply' : ''}">
          <div class="hg-notif-item-top">
            <span>Feedback / Query</span>
            <span>${dateStr}</span>
          </div>
          <p class="hg-notif-user-msg">${escapeNavHtml(msg.message)}</p>

          ${isReplied ? `
            <div class="hg-notif-admin-reply">
              <div class="hg-notif-admin-meta">💬 ${msg.replied_by || 'Admin (HarshGuruJi)'} • ${replyDate}</div>
              <div>${escapeNavHtml(msg.admin_reply)}</div>
            </div>
          ` : `
            <div class="hg-notif-pending-status">
              <span>⏳ Status: Received &amp; in review by team</span>
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  async function markRepliesAsRead() {
    const unread = userMessagesCache.filter(m => m.admin_reply && !m.user_read);
    if (unread.length === 0) return;

    const unreadIds = unread.map(m => m.id);
    // Optimistically update local
    unread.forEach(m => m.user_read = true);
    if (notifBadge) notifBadge.style.display = 'none';

    try {
      const { supabase } = await import('./js/supabase.js');
      await supabase
        .from('contact_messages')
        .update({ user_read: true })
        .in('id', unreadIds);
    } catch (err) {
      console.warn("Could not mark replies as read:", err);
    }
  }

  function escapeNavHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Listen for feedback submission from contact.html
  window.addEventListener('feedback-submitted', () => {
    const currentUserId = window._currentNavUserId;
    if (currentUserId) loadUserNotifications(currentUserId);
  });

  // Chat Unread Count Sync for Global Floating Button
  async function syncChatUnreadBadge(userId) {
    if (!userId) return;
    try {
      const { supabase } = await import('./js/supabase.js');
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .neq('status', 'seen');

      const badge = document.getElementById('hg-chat-unread-badge');
      const bottomChatDot = document.getElementById('bottom-chat-unread-dot');
      if (badge) {
        if (!error && count && count > 0) {
          badge.textContent = count > 9 ? '9+' : count;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      }
      if (bottomChatDot) {
        bottomChatDot.style.display = (!error && count && count > 0) ? 'block' : 'none';
      }
    } catch (e) {
      console.warn("Chat badge sync notice:", e);
    }
  }

  function subscribeToChatRealtimeBadge(userId) {
    if (!userId || window.__chatBadgeSubscribed) return;
    window.__chatBadgeSubscribed = true;
    try {
      import('./js/supabase.js').then(({ supabase }) => {
        supabase
          .channel('nav_chat_badge')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          }, () => {
            syncChatUnreadBadge(userId);
          })
          .subscribe();
      }).catch(() => {});
    } catch (e) {}
  }

  // 6. Handle Auth State Changes
  const updateNavUI = (user, profile) => {
    const loginBtn = document.getElementById('hg-login-btn');
    if (isStorePage) {
      if (loginBtn) loginBtn.style.display = 'none';
      const mDrawerAuth = document.getElementById('hg-mobile-drawer-auth');
      if (mDrawerAuth) mDrawerAuth.style.display = 'none';
    }
    const userMenu = document.getElementById('hg-user-profile');
    const userAvatar = document.getElementById('hg-user-avatar');
    const notifBox = document.getElementById('hg-notif-container');

    const bottomAuthItem = document.getElementById('bottom-nav-auth');
    const bottomAuthLabel = document.getElementById('bottom-auth-label');
    const bottomAuthDefaultIcon = document.getElementById('bottom-auth-default-icon');
    const bottomAuthAvatar = document.getElementById('bottom-auth-avatar');
    const bottomGoldenTick = document.getElementById('bottom-golden-tick');
    const mobileDrawerAuth = document.getElementById('hg-mobile-drawer-auth');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'block';
      if (notifBox) notifBox.style.display = 'flex';
      
      const displayName = (profile && profile.display_name) || user.email.split('@')[0];
      const avatarUrl = (profile && profile.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
      if (userAvatar) {
        userAvatar.src = avatarUrl;
      }

      // Populate 21st.dev Account Drawer
      const drawerAvatar = document.getElementById('hg-drawer-avatar');
      if (drawerAvatar) drawerAvatar.src = avatarUrl;
      const drawerName = document.getElementById('hg-drawer-name');
      if (drawerName) drawerName.textContent = displayName;
      const drawerEmail = document.getElementById('hg-drawer-email');
      if (drawerEmail) drawerEmail.textContent = user.email || '';
      const drawerGoldenTick = document.getElementById('hg-drawer-golden-tick');
      if (drawerGoldenTick) {
        drawerGoldenTick.style.display = (profile && profile.golden_tick === true) ? 'flex' : 'none';
      }
      const drawerBadge = document.getElementById('hg-drawer-badge');
      if (drawerBadge) {
        if (profile && profile.golden_tick === true) {
          drawerBadge.textContent = 'Contributor';
          drawerBadge.style.color = '#ffd700';
          drawerBadge.style.borderColor = 'rgba(255, 215, 0, 0.4)';
          drawerBadge.style.background = 'rgba(255, 215, 0, 0.12)';
        } else {
          drawerBadge.textContent = 'Member';
          drawerBadge.style.color = '#ff6b4a';
          drawerBadge.style.borderColor = 'rgba(255, 107, 74, 0.3)';
          drawerBadge.style.background = 'rgba(255, 107, 74, 0.15)';
        }
      }

      // Update Bottom Bar Auth Tab to Profile & sync bottom sheet
      const sheetAvatar = document.getElementById('hg-bottom-sheet-avatar');
      if (sheetAvatar) sheetAvatar.src = avatarUrl;
      const sheetName = document.getElementById('hg-bottom-sheet-name');
      if (sheetName) sheetName.textContent = displayName;
      const sheetEmail = document.getElementById('hg-bottom-sheet-email');
      if (sheetEmail) sheetEmail.textContent = user.email || '';

      if (bottomAuthItem) {
        bottomAuthItem.href = dashUrl;
        const p = (window.location.pathname || '').toLowerCase();
        if (p.includes('dashboard') || p.includes('settings')) {
          bottomAuthItem.classList.add('active');
        }
        bottomAuthItem.onclick = (e) => {
          if (window.innerWidth <= 1024) {
            e.preventDefault();
            toggleAccountDrawer();
          }
        };
      }
      if (bottomAuthLabel) {
        bottomAuthLabel.textContent = 'Profile';
      }
      if (bottomAuthDefaultIcon) {
        bottomAuthDefaultIcon.style.display = 'none';
      }
      if (bottomAuthAvatar) {
        bottomAuthAvatar.src = avatarUrl;
        bottomAuthAvatar.style.display = 'block';
      }
      if (bottomGoldenTick) {
        bottomGoldenTick.style.display = (profile && profile.golden_tick === true) ? 'flex' : 'none';
      }
      if (mobileDrawerAuth) {
        mobileDrawerAuth.href = dashUrl;
        mobileDrawerAuth.textContent = 'My Profile & Dashboard';
      }

      // Left-corner Golden Tick on user profile avatar
      const avatarWrap = document.getElementById('hg-user-avatar-wrap');
      if (avatarWrap) {
        let tick = document.getElementById('hg-nav-golden-tick');
        if (profile && profile.golden_tick === true) {
          if (!tick) {
            tick = document.createElement('span');
            tick.id = 'hg-nav-golden-tick';
            tick.className = 'golden-tick-badge';
            tick.title = 'Golden Verified Contributor';
            tick.textContent = '✓';
            avatarWrap.appendChild(tick);
          }
        } else if (tick) {
          tick.remove();
        }
      }

      loadUserNotifications(user.id);
      syncChatUnreadBadge(user.id);
      subscribeToChatRealtimeBadge(user.id);
    } else {
      if (typeof closeAccountDrawer === 'function') closeAccountDrawer();
      if (loginBtn) { loginBtn.href = loginUrl; loginBtn.style.display = isStorePage ? 'none' : 'inline-flex'; }
      if (userMenu) userMenu.style.display = 'none';
      if (notifBox) notifBox.style.display = 'none';
      toggleNotifDropdown(false);
      window._currentNavUserId = null;

      const chatBadge = document.getElementById('hg-chat-unread-badge');
      const bottomChatDot = document.getElementById('bottom-chat-unread-dot');
      if (chatBadge) chatBadge.style.display = 'none';
      if (bottomChatDot) bottomChatDot.style.display = 'none';

      const overlay = document.getElementById('hg-bottom-profile-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
      }

      // Update Bottom Bar Auth Tab to Login
      if (bottomAuthItem) {
        bottomAuthItem.onclick = null;
        bottomAuthItem.href = loginUrl;
        const p = (window.location.pathname || '').toLowerCase();
        if (p.includes('login') || p.includes('signup')) {
          bottomAuthItem.classList.add('active');
        }
      }
      if (bottomAuthLabel) {
        bottomAuthLabel.textContent = 'Login';
      }
      if (bottomAuthDefaultIcon) {
        bottomAuthDefaultIcon.style.display = 'block';
      }
      if (bottomAuthAvatar) {
        bottomAuthAvatar.style.display = 'none';
      }
      if (bottomGoldenTick) {
        bottomGoldenTick.style.display = 'none';
      }
      if (mobileDrawerAuth) {
        mobileDrawerAuth.href = loginUrl;
        mobileDrawerAuth.textContent = 'Sign In to HarshGuruJi';
      }
    }
  };

  // Mobile bottom profile sheet interactions
  const bottomSheetClose = () => {
    const overlay = document.getElementById('hg-bottom-profile-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        if (!overlay.classList.contains('active')) overlay.style.display = 'none';
      }, 250);
    }
  };

  const sheetCloseBtn = document.getElementById('hg-bottom-sheet-close');
  if (sheetCloseBtn) {
    sheetCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bottomSheetClose();
    });
  }

  const bottomOverlay = document.getElementById('hg-bottom-profile-overlay');
  if (bottomOverlay) {
    bottomOverlay.addEventListener('click', (e) => {
      if (e.target === bottomOverlay) {
        bottomSheetClose();
      }
    });
  }

  const bottomSheetLogout = document.getElementById('hg-bottom-sheet-logout-btn');
  if (bottomSheetLogout) {
    bottomSheetLogout.addEventListener('click', () => {
      bottomSheetClose();
      import('./js/supabase.js').then(async ({ supabase }) => {
        await supabase.auth.signOut();
        window.location.href = prefix + "index.html";
      }).catch(err => console.log('Supabase signout not available on this page.'));
    });
  }

  
  // --- 21st.dev Account Menu Sidebar Drawer Logic (@lavikatiyar/components/menu) ---
  const getAccountDrawer = () => document.getElementById('hg-account-drawer');
  const getAccountOverlay = () => document.getElementById('hg-account-overlay');

  const openAccountDrawer = () => {
    const drawer = getAccountDrawer();
    const overlay = getAccountOverlay();
    const trigger = document.getElementById('hg-user-trigger-btn') || document.querySelector('.hg-user-trigger');
    if (drawer && overlay) {
      overlay.style.display = 'block';
      void overlay.offsetWidth;
      overlay.classList.add('active');
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeAccountDrawer = () => {
    const drawer = getAccountDrawer();
    const overlay = getAccountOverlay();
    const trigger = document.getElementById('hg-user-trigger-btn') || document.querySelector('.hg-user-trigger');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!overlay.classList.contains('active')) {
          overlay.style.display = 'none';
        }
      }, 320);
    }
  };

  const toggleAccountDrawer = () => {
    const drawer = getAccountDrawer();
    if (drawer && drawer.classList.contains('active')) {
      closeAccountDrawer();
    } else {
      openAccountDrawer();
    }
  };

  window.openHarshAccountDrawer = openAccountDrawer;
  window.closeHarshAccountDrawer = closeAccountDrawer;
  window.toggleHarshAccountDrawer = toggleAccountDrawer;

  // Bind trigger click
  const userTrigger = document.getElementById('hg-user-trigger-btn') || document.querySelector('.hg-user-trigger');
  if (userTrigger) {
    userTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleAccountDrawer();
    });
  }

  // Bind drawer close button
  const drawerCloseBtn = document.getElementById('hg-drawer-close');
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAccountDrawer();
    });
  }

  // Bind backdrop overlay click
  const drawerOverlay = document.getElementById('hg-account-overlay');
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
      closeAccountDrawer();
    });
  }

  // Bind escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const drawer = getAccountDrawer();
      if (drawer && drawer.classList.contains('active')) {
        closeAccountDrawer();
      }
    }
  });

  // Close drawer when clicking internal nav links
  const drawerEl = document.getElementById('hg-account-drawer');
  if (drawerEl) {
    drawerEl.querySelectorAll('.hg-drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        closeAccountDrawer();
      });
    });
  }

  // Common logout function
  const executeNavSignOut = async () => {
    closeAccountDrawer();
    const client = window.supabaseClient || (window.AuthManager && window.AuthManager.supabase);
    if (client && client.auth) {
      await client.auth.signOut().catch(() => {});
    } else {
      try {
        const { supabase } = await import(`${prefix}js/supabase.js`);
        await supabase.auth.signOut().catch(() => {});
      } catch(e) {}
    }
    window.location.href = (isLocal || window.location.protocol === 'file:') ? (prefix + "index.html") : 'https://webguruji.online/index.html';
  };

  const accountLogoutBtn = document.getElementById('hg-account-logout-btn');
  if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeNavSignOut();
    });
  }

  // Logout listener
  const logoutBtn = document.getElementById('hg-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const client = window.supabaseClient || (window.AuthManager && window.AuthManager.supabase);
      if (client && client.auth) {
        await client.auth.signOut().catch(() => {});
      } else {
        try {
          const { supabase } = await import(`${prefix}js/supabase.js`);
          await supabase.auth.signOut().catch(() => {});
        } catch(e) {}
      }
      window.location.href = (isLocal || window.location.protocol === 'file:') ? (prefix + "index.html") : 'https://webguruji.online/index.html';
    });
  }

  // Subscribe to auth events if available
  window.addEventListener('auth-state-changed', (e) => {
    updateNavUI(e.detail.user, e.detail.profile);
  });

  // Check auth state immediately across all pages and subdirectories
  function checkNavAuth() {
    if (window.AuthManager && window.AuthManager.currentUser) {
      updateNavUI(window.AuthManager.currentUser, window.AuthManager.currentProfile);
      return;
    }
    const client = window.supabaseClient || (window.AuthManager && window.AuthManager.supabase);
    if (client && client.auth) {
      client.auth.getSession().then(({ data }) => {
        const session = data && data.session;
        if (session && session.user) {
          import(`${prefix}js/profile.js`).then(({ getProfile }) => {
            getProfile(session.user.id).then(profile => updateNavUI(session.user, profile));
          }).catch(() => updateNavUI(session.user, null));
        } else {
          updateNavUI(null, null);
        }
      }).catch(() => {});

      if (typeof client.auth.onAuthStateChange === 'function') {
        client.auth.onAuthStateChange((event, newSession) => {
          if (newSession && newSession.user) {
            import(`${prefix}js/profile.js`).then(({ getProfile }) => {
              getProfile(newSession.user.id).then(profile => updateNavUI(newSession.user, profile));
            }).catch(() => updateNavUI(newSession.user, null));
          } else if (event === 'SIGNED_OUT') {
            updateNavUI(null, null);
          }
        });
      }
      return;
    }
    // Fallback dynamic import with prefix
    import(`${prefix}js/supabase.js`).then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        const session = data && data.session;
        if (session && session.user) {
          import(`${prefix}js/profile.js`).then(({ getProfile }) => {
            getProfile(session.user.id).then(profile => updateNavUI(session.user, profile));
          }).catch(() => updateNavUI(session.user, null));
        } else {
          updateNavUI(null, null);
        }
      }).catch(() => {});
    }).catch(() => {});
  }
  checkNavAuth();
});
