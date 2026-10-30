/**
 * HarshGuruJi Global Premium Footer — Doodle Crew Edition
 * Hand-drawn sketchbook aesthetic with living SVG characters, doodles & full interactive navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure Google AdSense on public content pages
  const isNoIndex = document.querySelector('meta[name="robots"][content*="noindex"]');
  const path = (window.location.pathname || '').toLowerCase();
  const isRestricted = isNoIndex || 
                       path.includes('admin') || 
                       path.includes('login') || 
                       path.includes('signup') || 
                       path.includes('reset-password') || 
                       path.includes('consent');

  if (!isRestricted) {
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      meta.content = 'ca-pub-7706204118195419';
      document.head.appendChild(meta);
    }
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7706204118195419';
      document.head.appendChild(script);
    }
  }

  const MAIN_SITE = 'https://webguruji.online';

  // Remove existing footers if any
  document.querySelectorAll('footer.footer, footer.hg-global-footer, footer.relative.z-20, #footer-placeholder').forEach(el => el.remove());

  const currentYear = new Date().getFullYear();

  // Create footer container
  const footer = document.createElement('footer');
  footer.className = 'hg-global-footer dcf';
  footer.setAttribute('data-play', '0');
  footer.setAttribute('data-interactive', '1');

  // Inject markup
  footer.innerHTML = `
    <!-- Top Band: Brand, Blurb, Search & Navigation Columns -->
    <div class="dcf-top dcf-rise" style="--d: 0ms;">
      <div class="dcf-brand-area">
        <div class="dcf-brand">
          <a href="${MAIN_SITE}/index.html" class="dcf-logo" aria-label="HarshGuruJi Home">
            <img src="${MAIN_SITE}/logo.png" alt="HarshGuruJi" style="width:28px;height:28px;border-radius:6px;object-fit:contain;" />
          </a>
          <a href="${MAIN_SITE}/index.html" class="dcf-brandname">HarshGuruJi</a>
        </div>
        <p class="dcf-blurb">
          HarshGuruJi is a premium digital platform for learning, AI, tools, knowledge, games, and useful online resources. Learn • Create • Explore • Build.
        </p>
        <div class="dcf-search">
          <input type="text" id="hg-footer-search-input" placeholder="Search HarshGuruJi..." aria-label="Search HarshGuruJi" />
          <button type="button" id="hg-footer-search-btn" aria-label="Search">Search</button>
        </div>
      </div>

      <nav class="dcf-cols" aria-label="Footer Navigation">
        <div class="dcf-col">
          <h5 class="dcf-coltitle">Platform</h5>
          <ul>
            <li><a href="${MAIN_SITE}/index.html" class="dcf-link"><span>HarshGuruJi Home</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/ai-hub.html" class="dcf-link"><span>AI Hub</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/daily-special.html" class="dcf-link"><span>Daily Special</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/dashboard.html" class="dcf-link"><span>Dashboard</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/explore.html" class="dcf-link"><span>Explore</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
          </ul>
        </div>

        <div class="dcf-col">
          <h5 class="dcf-coltitle">Tools</h5>
          <ul>
            <li><a href="${MAIN_SITE}/free-tools.html" class="dcf-link"><span>All Tools</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/explore.html?search=Text" class="dcf-link"><span>Text Tools</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/explore.html?search=Calculator" class="dcf-link"><span>Calculators</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/explore.html?search=Converter" class="dcf-link"><span>Converters</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/explore.html?search=Developer" class="dcf-link"><span>Dev Tools</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
          </ul>
        </div>

        <div class="dcf-col">
          <h5 class="dcf-coltitle">Learning</h5>
          <ul>
            <li><a href="${MAIN_SITE}/learning-hub.html" class="dcf-link"><span>Learning Hub</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="https://books.webguruji.online" class="dcf-link"><span>NCERT Library</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/education.html" class="dcf-link"><span>Education</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/learning/class-10-science.html" class="dcf-link"><span>Class 10</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/learning/class.html?class=9" class="dcf-link"><span>Class 9</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/learning/gk-quiz.html" class="dcf-link"><span>Quizzes</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
          </ul>
        </div>

        <div class="dcf-col">
          <h5 class="dcf-coltitle">Games & Apps</h5>
          <ul>
            <li><a href="https://store.webguruji.online" class="dcf-link"><span>GuruStore</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="https://chat.webguruji.online" class="dcf-link"><span>GuruChats</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="https://tube.webguruji.online/" class="dcf-link"><span>GuruTube</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/gaming-hub.html" class="dcf-link"><span>Gaming Hub</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/ai-hub.html" class="dcf-link"><span>AI Hub</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/Quiz India/index.html" class="dcf-link"><span>Quiz India</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
          </ul>
        </div>

        <div class="dcf-col">
          <h5 class="dcf-coltitle">Company & Legal</h5>
          <ul>
            <li><a href="${MAIN_SITE}/about.html" class="dcf-link"><span>About Us</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/contact.html" class="dcf-link"><span>Contact Us</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/contributor.html" class="dcf-link"><span>Contributors</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/privacy-policy.html" class="dcf-link"><span>Privacy Policy</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/terms-and-conditions.html" class="dcf-link"><span>Terms &amp; Conditions</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/disclaimer.html" class="dcf-link"><span>Disclaimer</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
            <li><a href="${MAIN_SITE}/cookie.html" class="dcf-link"><span>Cookies Policy</span><svg class="dcf-squiggle" viewBox="0 0 100 8" preserveAspectRatio="none"><path pathLength="1" d="M1 5 C10 1 16 7 25 4 S40 1 50 4 S66 7 75 4 S90 1 99 4"/></svg></a></li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- Center Stage: Giant Wordmark with Doodle Characters -->
    <div class="dcf-world" id="dcf-world">
      <div class="dcf-stage">
        <h2 class="dcf-sr">HARSHGURUJI</h2>
        <svg id="dcf-svg" class="dcf-svg" viewBox="-24 -180 1440 240" role="group" aria-label="HARSHGURUJI — meet the crew">
          <defs>
            <pattern id="dcf-hatch" width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <line x1="0" y1="0" x2="0" y2="4.6" stroke="var(--dcf-ink)" stroke-width="1.25" />
            </pattern>
            <filter id="dcf-ink" x="-4%" y="-6%" width="108%" height="112%">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="edge" />
              <feDisplacementMap in="SourceGraphic" in2="edge" scale="4" xChannelSelector="R" yChannelSelector="G" result="rough" />
            </filter>
          </defs>

          <!-- Ground Line -->
          <g class="dcf-ground">
            <path class="dcf-draw" pathLength="1" d="M-10 6 Q120 4 240 7 Q380 9 520 6 Q680 4 820 7 Q980 9 1120 6 Q1260 5 1400 6" style="--d: 60ms;"></path>
            <path class="dcf-tufts dcf-fade" d="M60 6 l2 -8 M63 6 l1 -11 M66 6 l-1 -7 M240 6 l2 -9 M243 6 l1 -12 M246 6 l-1 -7 M580 6 l2 -8 M583 6 l1 -11 M586 6 l-1 -7 M920 6 l2 -8 M923 6 l1 -11 M926 6 l-1 -7 M1240 6 l2 -8 M1243 6 l1 -11 M1246 6 l-1 -7" style="--d: 560ms;"></path>
          </g>

          <!-- Letters: HARSHGURUJI -->
          <g class="dcf-letters" id="dcf-letters-group"></g>

          <!-- Crew Characters Layer -->
          <g id="dcf-crew-layer"></g>
        </svg>

        <!-- Dynamic Speech Bubbles -->
        <div class="dcf-bubbles" id="dcf-bubbles-layer" aria-live="polite"></div>
      </div>

      <!-- Falling / Floating Doodles -->
      <div class="dcf-doodles" id="dcf-doodles-layer" aria-hidden="true"></div>

      <!-- CTA Section -->
      <div class="dcf-cta">
        <p class="dcf-tagline" id="dcf-tagline">
          <span class="dcf-word">A </span><span class="dcf-word">hand-drawn </span><span class="dcf-word">universe </span><span class="dcf-word">for </span><span class="dcf-word">curious </span><span class="dcf-word">minds, </span><span class="dcf-word">creators </span><span class="dcf-word">and </span><span class="dcf-word">builders.</span>
        </p>
        <div class="dcf-actions">
          <a href="${MAIN_SITE}/ai-hub.html" class="dcf-btn is-solid">
            <svg class="dcf-icon" viewBox="-16 -16 32 32" width="18" height="18" fill="none"><path fill="#ffd23f" d="M3 -14 L-8 2 L-1 2 L-4 14 L8 -3 L1 -3 Z" /></svg>
            <span>Explore AI Hub</span>
          </a>
          <a href="https://store.webguruji.online" target="_blank" rel="noopener noreferrer" class="dcf-btn is-outline">
            <svg class="dcf-icon" viewBox="-16 -16 32 32" width="18" height="18" fill="none"><path fill="#ffd23f" d="M0 -13 L3.6 -4.4 L13 -4 L5.8 2.2 L8.2 12 L0 6.6 L-8.2 12 L-5.8 2.2 L-13 -4 L-3.6 -4.4 Z" /></svg>
            <span>Visit GuruStore</span>
          </a>
          <a href="https://books.webguruji.online" target="_blank" rel="noopener noreferrer" class="dcf-btn is-outline">
            <svg class="dcf-icon" viewBox="-16 -16 32 32" width="18" height="18" fill="none"><path fill="#ff5c7a" d="M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -8 -13 -4 -11 C-2 -10 -1 -8 0 -6 C1 -8 2 -10 4 -11 C8 -13 13 -10 13 -5 C13 1 6 6 0 11 Z" /></svg>
            <span>NCERT Books</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Bar: Founder info, Copyright, Socials, Back to Top -->
    <div class="dcf-bar dcf-rise" style="--d: 120ms;">
      <a href="${MAIN_SITE}/owner.html" class="dcf-founder" title="Meet Founder Harsh Patel" aria-label="Harsh Patel Founder Profile">
        <img src="${MAIN_SITE}/harshlogo.png" alt="Harsh Patel" onerror="this.src='${MAIN_SITE}/logo.png'" />
        <div class="dcf-founder-text">
          <span class="dcf-founder-name">Harsh Patel <span style="color:#60a5fa;">✓</span></span>
          <span class="dcf-founder-badge">Founder &amp; Owner</span>
        </div>
      </a>

      <p class="dcf-copy">
        &copy; <span id="hg-footer-year">${currentYear}</span> HarshGuruJi. All Rights Reserved. Made with ❤️ by HarshGuruJi.
      </p>

      <div class="dcf-socials-group">
        <a href="https://youtube.com/@harshguruji1" target="_blank" rel="noopener noreferrer" class="dcf-social-link" title="YouTube" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" /></svg>
        </a>
        <a href="https://www.instagram.com/harshguruji1/" target="_blank" rel="noopener noreferrer" class="dcf-social-link" title="Instagram" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.3-.1 1.6-.1 4.8-.1zm0-2.2C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4A6.2 6.2 0 0012 5.8zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" /></svg>
        </a>
        <a href="https://t.me/officialharshguruji1" target="_blank" rel="noopener noreferrer" class="dcf-social-link" title="Telegram" aria-label="Telegram">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
        </a>
      </div>

      <button type="button" class="dcf-totop" id="dcf-totop-btn">
        <span>Back to top</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 20 C11 14 12.5 9 12 4 M6 10 C8 8 10 6 12 4 C14 6 16 8 18.5 9.5" />
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(footer);

  // Search input handler
  const searchInput = document.getElementById('hg-footer-search-input');
  const searchBtn = document.getElementById('hg-footer-search-btn');
  if (searchInput && searchBtn) {
    const doSearch = () => {
      const q = searchInput.value.trim();
      if (q) window.open(`${MAIN_SITE}/explore.html?search=${encodeURIComponent(q)}`, '_blank');
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
  }

  // Back to top
  const toTopBtn = document.getElementById('dcf-totop-btn');
  if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // DOODLE CREW ENGINE (Mathematical layout, characters & physics)
  // =========================================================================
  const word = "HARSHGURUJI";
  const lettersGroup = document.getElementById('dcf-letters-group');
  const crewLayer = document.getElementById('dcf-crew-layer');
  const bubblesLayer = document.getElementById('dcf-bubbles-layer');
  const doodlesLayer = document.getElementById('dcf-doodles-layer');
  const svg = document.getElementById('dcf-svg');
  const world = document.getElementById('dcf-world');

  // Word layout calculation
  const letterAdvances = [135, 120, 125, 115, 135, 130, 125, 125, 120, 115, 60]; // Approximated for 11 chars
  let curX = 20;
  const letterPositions = [];

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const w = letterAdvances[i] || 115;
    letterPositions.push({ x: curX, w: w, char: char });

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'dcf-letter');
    g.style.setProperty('--d', `${160 + i * 70}ms`);
    g.style.setProperty('--r', `${((Math.sin(i * 2.3) * 4)).toFixed(2)}deg`);

    g.innerHTML = `
      <g class="dcf-glyph">
        <text x="${curX}" y="0" font-size="160" font-weight="900" style="font-family: var(--dcf-display);" filter="url(#dcf-ink)">${char}</text>
      </g>
      <path class="dcf-dust" d="M${curX - 4} -6 l-12 -6 M${curX - 2} -14 l-10 -10 M${curX + w + 4} -6 l12 -6 M${curX + w + 2} -14 l10 -10"></path>
    `;
    lettersGroup.appendChild(g);
    curX += w + 2;
  }

  // Crew characters definition
  const crew = [
    { kind: 'yeti', letter: 0, name: 'Bruno', says: 'Hungry! Got snacks?', x: 70, y: 0, scale: 0.95 },
    { kind: 'bird', letter: 2, name: 'Pip', says: 'Tweet us! Explore tools.', x: 310, y: -115, scale: 1.1 },
    { kind: 'mushroom', letter: 4, name: 'Morel', says: 'Learning is super fun!', x: 570, y: 0, scale: 0.9 },
    { kind: 'kid', letter: 6, name: 'Juno', says: 'Best view from up here!', x: 820, y: -115, scale: 1.1 },
    { kind: 'ghost', letter: 8, name: 'Boo', says: 'Boo! Welcome to HarshGuruJi!', x: 1060, y: -90, scale: 1.05 },
    { kind: 'cat', letter: 9, name: 'Patch', says: 'Purr... nice cursor you have!', x: 1220, y: 0, scale: 0.95 }
  ];

  // Render Crew members
  crew.forEach((c, idx) => {
    const cg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    cg.setAttribute('transform', `translate(${c.x} ${c.y}) scale(${c.scale})`);
    cg.setAttribute('id', `dcf-crew-${idx}`);

    let bodySvg = '';
    if (c.kind === 'yeti') {
      bodySvg = `
        <ellipse class="dcf-shadow" cx="0" cy="2" rx="46" ry="5"></ellipse>
        <path class="dcf-art" d="M-36 -2 C-46 -26 -46 -60 -36 -82 C-26 -102 -10 -110 2 -110 C18 -110 34 -102 42 -82 C50 -60 50 -26 42 -2 Z" fill="#090a0f"></path>
        <circle cx="-12" cy="-78" r="6" fill="#fff"></circle><circle class="k pupil" cx="-12" cy="-78" r="3" fill="#090a0f"></circle>
        <circle cx="12" cy="-78" r="6" fill="#fff"></circle><circle class="k pupil" cx="12" cy="-78" r="3" fill="#090a0f"></circle>
        <path class="n" d="M-10 -60 C-5 -54 5 -54 10 -61" stroke="#f4f1ea" stroke-width="2" fill="none"></path>
      `;
    } else if (c.kind === 'bird') {
      bodySvg = `
        <path class="dcf-art" d="M-14 -12 C-16 -26 -8 -36 2 -36 C14 -36 18 -24 16 -12 C14 -4 6 -2 0 -2 Z" fill="#090a0f"></path>
        <path d="M15 -26 L24 -23 L15 -20 Z" fill="#ff9f1c"></path>
        <circle cx="4" cy="-24" r="4" fill="#fff"></circle><circle class="k pupil" cx="4" cy="-24" r="2" fill="#090a0f"></circle>
        <circle cx="11" cy="-25" r="4" fill="#fff"></circle><circle class="k pupil" cx="11" cy="-25" r="2" fill="#090a0f"></circle>
      `;
    } else if (c.kind === 'mushroom') {
      bodySvg = `
        <ellipse class="dcf-shadow" cx="0" cy="2" rx="16" ry="3"></ellipse>
        <path class="dcf-art" d="M-8 0 C-10 -8 -8 -18 -6 -24 L6 -24 C8 -18 10 -8 8 0 Z" fill="#090a0f"></path>
        <path class="dcf-art r" d="M-22 -24 C-24 -40 -10 -50 0 -50 C10 -50 24 -40 22 -24 Z" fill="#ff4d4d"></path>
        <circle cx="-10" cy="-36" r="3.5" fill="#fff"></circle><circle cx="6" cy="-40" r="3" fill="#fff"></circle>
        <circle cx="-4" cy="-14" r="2" fill="#090a0f" class="pupil"></circle><circle cx="4" cy="-14" r="2" fill="#090a0f" class="pupil"></circle>
      `;
    } else if (c.kind === 'kid') {
      bodySvg = `
        <path class="dcf-art" d="M-16 -4 C-18 -18 -14 -32 -8 -38 L8 -38 C14 -32 18 -18 16 -4 Z" fill="#090a0f"></path>
        <circle cx="0" cy="-52" r="14" fill="#090a0f" stroke="#f4f1ea" stroke-width="2"></circle>
        <circle cx="-5" cy="-52" r="2.2" fill="#fff" class="pupil"></circle><circle cx="5" cy="-52" r="2.2" fill="#fff" class="pupil"></circle>
        <path d="M-12 -60 C-11 -74 11 -74 12 -60 Z" fill="#ff6b2c"></path>
      `;
    } else if (c.kind === 'ghost') {
      bodySvg = `
        <path class="dcf-art" d="M-20 -10 L-20 -36 C-20 -54 -10 -62 0 -62 C10 -62 20 -54 20 -36 L20 -10 C10 -6 -10 -6 -20 -10 Z" fill="#090a0f"></path>
        <circle cx="-7" cy="-38" r="5" fill="#fff"></circle><circle class="k pupil" cx="-7" cy="-38" r="2.5" fill="#090a0f"></circle>
        <circle cx="8" cy="-38" r="5" fill="#fff"></circle><circle class="k pupil" cx="8" cy="-38" r="2.5" fill="#090a0f"></circle>
      `;
    } else {
      bodySvg = `
        <ellipse class="dcf-shadow" cx="0" cy="2" rx="26" ry="4"></ellipse>
        <path class="dcf-art" d="M-18 0 C-22 -14 -18 -34 -10 -42 L10 -42 C18 -34 22 -14 18 0 Z" fill="#090a0f"></path>
        <circle cx="0" cy="-56" r="18" fill="#090a0f" stroke="#f4f1ea" stroke-width="2"></circle>
        <path d="M-16 -68 L-18 -84 L-4 -76 Z" fill="#090a0f" stroke="#f4f1ea" stroke-width="2"></path>
        <path d="M6 -76 L18 -84 L16 -68 Z" fill="#090a0f" stroke="#f4f1ea" stroke-width="2"></path>
        <circle cx="8" cy="-60" r="4.5" fill="#fff"></circle><circle class="k pupil" cx="8" cy="-60" r="2.4" fill="#090a0f"></circle>
      `;
    }

    cg.innerHTML = `
      <g class="dcf-arrive dcf-arrive-front" style="--d: ${600 + idx * 120}ms;">
        <g class="dcf-hopper" id="dcf-hopper-${idx}">
          ${bodySvg}
        </g>
      </g>
      <rect class="dcf-hit" x="-35" y="-120" width="70" height="130" role="button" aria-label="${c.name}: ${c.says}"></rect>
    `;
    crewLayer.appendChild(cg);

    // Click handler for crew member
    const hitArea = cg.querySelector('.dcf-hit');
    hitArea.addEventListener('click', () => {
      const hopper = cg.querySelector('.dcf-hopper');
      hopper.classList.add('is-hop');
      setTimeout(() => hopper.classList.remove('is-hop'), 650);

      // Show speech bubble
      bubblesLayer.innerHTML = `
        <div class="dcf-bubble" style="left: ${((c.x + 24) / 1440 * 100).toFixed(2)}%; top: ${c.y < -50 ? '30%' : '52%'};">
          ${c.says}
        </div>
      `;
      clearTimeout(cg._bubbleTimer);
      cg._bubbleTimer = setTimeout(() => { bubblesLayer.innerHTML = ''; }, 3200);
    });
  });

  // Floating Doodles Setup
  const doodleIcons = [
    `<svg viewBox="-16 -16 32 32" width="28" height="28"><path fill="#ff7a1a" d="M0 14 C-9 14 -12 6 -10 0 C-8 -5 -4 -6 -4 -12 C1 -9 3 -5 2 -1 C4 -3 5 -6 5 -8 C10 -3 11 4 8 9 C6 12 3 14 0 14 Z" /><path fill="#ffd23f" d="M0 11.5 C-4 11.5 -6 8 -5 5 C-4 2 -1 1 -1 -3 C2 -1 4 3 3 6 C4 5 5 4 5 3 C7 6 5 11.5 0 11.5 Z" /></svg>`,
    `<svg viewBox="-16 -16 32 32" width="26" height="26"><path fill="#ffd23f" d="M0 -13 L3.6 -4.4 L13 -4 L5.8 2.2 L8.2 12 L0 6.6 L-8.2 12 L-5.8 2.2 L-13 -4 L-3.6 -4.4 Z" /></svg>`,
    `<svg viewBox="-16 -16 32 32" width="26" height="26"><path fill="#ff5c7a" d="M0 11 C-6 6 -13 1 -13 -5 C-13 -10 -8 -13 -4 -11 C-2 -10 -1 -8 0 -6 C1 -8 2 -10 4 -11 C8 -13 13 -10 13 -5 C13 1 6 6 0 11 Z" /></svg>`,
    `<svg viewBox="-16 -16 32 32" width="26" height="26"><path fill="#ffd23f" d="M3 -14 L-8 2 L-1 2 L-4 14 L8 -3 L1 -3 Z" /></svg>`,
    `<svg viewBox="-16 -16 32 32" width="24" height="24"><path fill="#8fdcff" d="M0 -13 C1 -4 4 -1 13 0 C4 1 1 4 0 13 C-1 4 -4 1 -13 0 C-4 -1 -1 -4 0 -13 Z" /></svg>`
  ];

  const floaters = [];
  const doodleCount = 10;
  for (let k = 0; k < doodleCount; k++) {
    const div = document.createElement('div');
    div.className = 'dcf-doodle';
    div.innerHTML = `<span class="dcf-doodle-in">${doodleIcons[k % doodleIcons.length]}</span>`;
    doodlesLayer.appendChild(div);

    const f = {
      el: div,
      x: Math.random() * (world.clientWidth || 1100),
      y: Math.random() * (world.clientHeight || 300),
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.7 + 0.4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 2,
      popped: false
    };

    div.addEventListener('pointerdown', () => {
      if (f.popped) return;
      f.popped = true;
      div.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      div.style.transform += ' scale(1.8)';
      div.style.opacity = '0';
      setTimeout(() => {
        f.y = -40;
        f.x = Math.random() * (world.clientWidth || 1100);
        f.popped = false;
        div.style.transition = '';
        div.style.opacity = '1';
      }, 1600);
    });

    floaters.push(f);
  }

  // Animation Frame Loop for Eye Tracking & Doodles
  let mouse = { x: -1000, y: -1000, inside: false };
  footer.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.inside = true;
  });
  footer.addEventListener('pointerleave', () => {
    mouse.inside = false;
  });

  let isFooterVisible = false;
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        isFooterVisible = true;
        footer.setAttribute('data-play', '1');
      }
    }
  }, { threshold: 0.1 });
  observer.observe(footer);

  function animate(t) {
    requestAnimationFrame(animate);
    if (!isFooterVisible) return;

    // Move Doodles
    const w = world.clientWidth || 1200;
    const h = world.clientHeight || 350;
    for (const f of floaters) {
      if (!f.popped) {
        f.y += f.vy;
        f.x += Math.sin(t / 800 + f.rot) * 0.5 + f.vx * 0.2;
        f.rot += f.vr;
        if (f.y > h + 30) {
          f.y = -30;
          f.x = Math.random() * w;
        }
        f.el.style.transform = `translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, 0) rotate(${f.rot.toFixed(1)}deg)`;
      }
    }

    // Pupils follow pointer
    if (mouse.inside && svg) {
      const rect = svg.getBoundingClientRect();
      const pupils = svg.querySelectorAll('.pupil');
      pupils.forEach(p => {
        const prect = p.getBoundingClientRect();
        const dx = mouse.x - prect.left;
        const dy = mouse.y - prect.top;
        const dist = Math.hypot(dx, dy) || 1;
        const move = Math.min(2.5, dist / 40);
        const px = (dx / dist) * move;
        const py = (dy / dist) * move;
        p.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
      });
    }
  }
  requestAnimationFrame(animate);
});
