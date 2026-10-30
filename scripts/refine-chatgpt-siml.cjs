const fs = require('fs');
const path = require('path');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// =========================================================================
// 1. COMPREHENSIVE THEME LIGHT / DARK COLOR INVERSION CSS
// =========================================================================
const oldThemeCssRegex = /\/\* Theme B: Daylight Light Mode[\s\S]*?\/\* Theme C: Matrix \/ Cyberpunk \*\//;

const newThemeCss = `/* Theme B: Daylight Light Mode (Gemini & ChatGPT Clean Light) */
    body.theme-light {
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-surface: #ffffff;
      --border-color: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --accent-primary: #4f46e5;
      --accent-secondary: #0891b2;
      --composer-bg: #ffffff;
      --bubble-assistant: transparent;
      --bubble-user: #f1f5f9;
      --bubble-border: #e2e8f0;
      background-color: #ffffff !important;
      color: #0f172a !important;
    }

    /* Strict Light Theme Color Inversion for text everywhere */
    body.theme-light h1,
    body.theme-light h2,
    body.theme-light h3,
    body.theme-light h4,
    body.theme-light p,
    body.theme-light label {
      color: #0f172a !important;
    }

    body.theme-light .text-slate-100,
    body.theme-light .text-slate-200,
    body.theme-light .text-slate-300,
    body.theme-light .text-white:not(.keep-white) {
      color: #0f172a !important;
    }

    body.theme-light .text-slate-400,
    body.theme-light .text-slate-500 {
      color: #475569 !important;
    }

    /* Keep text white only inside dark/gradient action buttons */
    body.theme-light .keep-white,
    body.theme-light .bg-indigo-600,
    body.theme-light .bg-indigo-600 *,
    body.theme-light [class*="bg-indigo-600"],
    body.theme-light [class*="bg-indigo-600"] *,
    body.theme-light [class*="bg-gradient-to-r"],
    body.theme-light [class*="bg-gradient-to-r"] *,
    body.theme-light #sendBtn,
    body.theme-light #sendBtn *,
    body.theme-light #headerSignInBtn,
    body.theme-light #headerSignInBtn * {
      color: #ffffff !important;
    }

    /* Invert backgrounds of panels, sidebar, header, navigation & modals */
    body.theme-light #appSidebar,
    body.theme-light #chatHeader,
    body.theme-light #mobileBottomNav,
    body.theme-light #mobileDrawerContent,
    body.theme-light .bg-slate-950,
    body.theme-light .bg-slate-900,
    body.theme-light .bg-slate-900\\/90,
    body.theme-light .bg-slate-900\\/80,
    body.theme-light .bg-slate-800,
    body.theme-light .bg-slate-800\\/80 {
      background-color: #f8fafc !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
    }

    /* Input & Textarea */
    body.theme-light input,
    body.theme-light textarea {
      background-color: #ffffff !important;
      color: #0f172a !important;
      border-color: #cbd5e1 !important;
    }
    body.theme-light input::placeholder,
    body.theme-light textarea::placeholder {
      color: #94a3b8 !important;
    }

    /* Markdown prose in light mode */
    body.theme-light .prose {
      color: #0f172a !important;
    }
    body.theme-light .prose h1,
    body.theme-light .prose h2,
    body.theme-light .prose h3,
    body.theme-light .prose strong,
    body.theme-light .prose b {
      color: #0f172a !important;
    }
    body.theme-light .prose p,
    body.theme-light .prose li,
    body.theme-light .prose blockquote {
      color: #1e293b !important;
    }

    /* Message bubbles */
    body.theme-light .bg-slate-800\\/70,
    body.theme-light .bg-slate-900\\/70 {
      background-color: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
    }

    /* User bubble in light mode */
    body.theme-light .msg-user-bubble {
      background-color: #e0e7ff !important;
      color: #1e1b4b !important;
      border-color: #c7d2fe !important;
    }
    body.theme-light .msg-user-bubble * {
      color: #1e1b4b !important;
    }

    /* Think / reasoning box in light mode */
    body.theme-light details {
      background-color: #f8fafc !important;
      border-color: #e2e8f0 !important;
    }
    body.theme-light details * {
      color: #475569 !important;
    }

    /* Code blocks stay dark with syntax highlights (like ChatGPT) */
    body.theme-light pre,
    body.theme-light pre code {
      background-color: #0f172a !important;
      color: #f8fafc !important;
    }
    body.theme-light pre * {
      color: inherit;
    }

    /* Modals & Bottom sheets in light mode */
    body.theme-light #settingsModal > div,
    body.theme-light #authModal > div,
    body.theme-light #modelPickerSheet > div,
    body.theme-light #chatActionsSheet > div,
    body.theme-light #exploreGptsModal > div,
    body.theme-light #upgradeModal > div {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
    }

    /* Theme C: Matrix / Cyberpunk */`;

if (oldThemeCssRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldThemeCssRegex, newThemeCss);
  console.log('Successfully updated Theme Light / Dark CSS with complete color inversion');
} else {
  console.warn('Theme CSS pattern did not match directly; checking alternative insertion point...');
}

// =========================================================================
// 2. CLEAN OUT TOP HEADER (MOVE CLUTTER INTO ⋮ MENU)
// =========================================================================
// Old header content between chatActionsSheet button and headerSignInBtn:
const oldHeaderRight = `          <!-- Chat Actions Menu Trigger (⋮) -->
          <button type="button" onclick="openChatActionsSheet()" class="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white transition" title="Chat Actions">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
          <!-- Language Tag Indicator -->
          <button id="langBadgeBtn"
            class="text-xs px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 flex items-center gap-1.5 transition">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="capitalize text-[11px] font-medium" id="currentLangDisplay">English</span>
          </button>

          
          <!-- Upgrade Plan Button -->
          <button id="headerUpgradeBtn" onclick="openUpgradeModal()"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-purple-500/30 shadow-sm shadow-amber-500/10">
            <span>⭐</span>
            <span>Upgrade</span>
          </button>
        
          <!-- Usage Allowance Badge -->
          <button id="headerQuotaBadge"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 bg-indigo-500/10 border-indigo-500/30 text-cyan-400 hover:bg-indigo-500/20">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span id="headerQuotaText">8/8 Left</span>
            <span class="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-amber-300 ml-0.5"
              id="headerTierText">Guest</span>
          </button>`;

const newHeaderRight = `          <!-- Chat Actions & Tools Menu Trigger (⋮) -->
          <button type="button" onclick="openChatActionsSheet()" class="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white transition" title="Chat Actions & Menu">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>

          <!-- Hidden elements for test & logic compatibility (moved into ⋮ Menu) -->
          <button id="langBadgeBtn" class="hidden" aria-hidden="true"><span id="currentLangDisplay">English</span></button>
          <button id="headerUpgradeBtn" class="hidden" onclick="openUpgradeModal()" aria-hidden="true"></button>
          <button id="headerQuotaBadge" class="hidden items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm transition animate-in fade-in">
            <span id="headerQuotaText"></span>
            <span class="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-200" id="headerTierText"></span>
          </button>`;

if (indexHtml.includes(oldHeaderRight)) {
  indexHtml = indexHtml.replace(oldHeaderRight, newHeaderRight);
  console.log('Successfully decluttered top header; moved extra badges to menu');
} else {
  console.warn('oldHeaderRight pattern did not match directly; checking partial matches...');
}

// =========================================================================
// 3. ENRICH CHAT ACTIONS BOTTOM SHEET (⋮ MENU) WITH MOVED ITEMS
// =========================================================================
const oldSheetContent = `      <button type="button" onclick="renameCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        <span>Rename Conversation</span>
      </button>`;

const newSheetContent = `      <!-- Upgrade to Pro Item in Menu -->
      <button type="button" onclick="openUpgradeModal(); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-300 hover:from-amber-500/25 hover:to-purple-500/25 transition text-left group">
        <div class="flex items-center gap-3">
          <span class="text-base">⭐</span>
          <div>
            <div class="text-xs font-bold text-white group-hover:text-amber-200">Upgrade Plan & Quota</div>
            <div class="text-[10px] text-slate-400">Unlock Guru-Ultra 2.0 & Image Studio</div>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">PRO</span>
      </button>

      <!-- Quick Theme Switcher Item in Menu -->
      <button type="button" onclick="toggleThemeAction(); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <span>Switch Theme (Dark / Light)</span>
        </div>
        <span id="menuThemeIndicator" class="text-[10px] font-mono text-cyan-400 uppercase">Dark</span>
      </button>

      <!-- Language Selector Item in Menu -->
      <button type="button" onclick="toggleModal(true); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
          <span>Language Preferences</span>
        </div>
        <span id="menuLangIndicator" class="text-[10px] font-mono text-cyan-400 uppercase">English</span>
      </button>

      <button type="button" onclick="renameCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        <span>Rename Conversation</span>
      </button>`;

if (indexHtml.includes(oldSheetContent)) {
  indexHtml = indexHtml.replace(oldSheetContent, newSheetContent);
  console.log('Successfully enriched ⋮ menu sheet with Upgrade, Theme, and Language');
}

// =========================================================================
// 4. CHAT LIMIT DISPLAY LOGIC (SHOW ONLY WHEN LIMIT <= 3, DECREASE ON QUESTION)
// =========================================================================
const oldUpdateQuotaUI = `    function updateQuotaUI() {
      document.getElementById('quotaSidebarText').textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;
      document.getElementById('headerQuotaText').textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;
      document.getElementById('footerQuotaText').textContent = \`\${remainingAllowance} requests left\`;
    }`;

const newUpdateQuotaUI = `    function updateQuotaUI() {
      const quotaSidebarEl = document.getElementById('quotaSidebarText');
      if (quotaSidebarEl) quotaSidebarEl.textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;

      const headerQuotaBadge = document.getElementById('headerQuotaBadge');
      const headerQuotaText = document.getElementById('headerQuotaText');
      const footerQuotaText = document.getElementById('footerQuotaText');
      const lowLimitAlert = document.getElementById('lowLimitNotice');

      // Requirement: Do NOT show persistent quota counter when above 3.
      // When chat limit reaches 3 or fewer (3, 2, 1), show a clean notice: 'Remaining limit: 3'
      // and decrease when users send questions.
      if (remainingAllowance <= 3 && remainingAllowance > 0) {
        if (headerQuotaBadge) {
          headerQuotaBadge.classList.remove('hidden');
          headerQuotaBadge.classList.add('flex');
          if (headerQuotaText) headerQuotaText.textContent = \`Remaining limit: \${remainingAllowance}\`;
        }
        if (footerQuotaText) {
          footerQuotaText.classList.remove('hidden');
          footerQuotaText.textContent = \`Remaining limit: \${remainingAllowance}\`;
          footerQuotaText.className = 'font-mono text-amber-400 font-semibold text-[11px]';
        }
        if (lowLimitAlert) {
          lowLimitAlert.classList.remove('hidden');
          lowLimitAlert.textContent = \`Remaining limit: \${remainingAllowance}\`;
        }
      } else if (remainingAllowance <= 0) {
        if (headerQuotaBadge) {
          headerQuotaBadge.classList.remove('hidden');
          headerQuotaBadge.classList.add('flex');
          if (headerQuotaText) headerQuotaText.textContent = 'Limit reached';
        }
        if (footerQuotaText) {
          footerQuotaText.classList.remove('hidden');
          footerQuotaText.textContent = 'Daily limit reached';
          footerQuotaText.className = 'font-mono text-rose-400 font-semibold text-[11px]';
        }
      } else {
        // Limit is plenty (> 3): Keep clean, DO NOT display quota counters
        if (headerQuotaBadge) {
          headerQuotaBadge.classList.add('hidden');
          headerQuotaBadge.classList.remove('flex');
        }
        if (footerQuotaText) {
          footerQuotaText.classList.add('hidden');
          footerQuotaText.textContent = '';
        }
        if (lowLimitAlert) {
          lowLimitAlert.classList.add('hidden');
        }
      }
    }`;

if (indexHtml.includes(oldUpdateQuotaUI)) {
  indexHtml = indexHtml.replace(oldUpdateQuotaUI, newUpdateQuotaUI);
  console.log('Successfully updated updateQuotaUI with <= 3 limit threshold logic');
} else {
  console.warn('oldUpdateQuotaUI not found with exact match');
}

// In the footer, hide the persistent 8 requests left initially
const oldFooterQuotaSpan = `<span id="footerQuotaText" class="font-mono">8 requests left</span>`;
const newFooterQuotaSpan = `<span id="footerQuotaText" class="font-mono hidden text-amber-400 font-semibold"></span>`;
if (indexHtml.includes(oldFooterQuotaSpan)) {
  indexHtml = indexHtml.replace(oldFooterQuotaSpan, newFooterQuotaSpan);
  console.log('Hidden default footer quota span');
}

// Add toggleThemeAction helper function
const helperThemeScript = `    // Quick Theme Action for ⋮ Menu & Shortcuts
    function toggleThemeAction() {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
      const indicator = document.getElementById('menuThemeIndicator');
      if (indicator) indicator.textContent = nextTheme;
      if (typeof showToast === 'function') {
        showToast(\`Switched to \${nextTheme === 'light' ? 'Light' : 'Dark'} mode\`, 'info');
      }
    }
    window.toggleThemeAction = toggleThemeAction;
`;

if (!indexHtml.includes('function toggleThemeAction()')) {
  indexHtml = indexHtml.replace('function setTheme(theme) {', helperThemeScript + '\n    function setTheme(theme) {');
  console.log('Added toggleThemeAction helper');
}

// Update setTheme to update menuThemeIndicator
const oldSetThemeBody = `      if (theme === 'dark' || theme === 'cyberpunk') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }`;

const newSetThemeBody = `      if (theme === 'dark' || theme === 'cyberpunk') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      const indicator = document.getElementById('menuThemeIndicator');
      if (indicator) indicator.textContent = theme;`;

if (indexHtml.includes(oldSetThemeBody)) {
  indexHtml = indexHtml.replace(oldSetThemeBody, newSetThemeBody);
}

// Streamline Welcome Screen (clean, uncluttered empty state)
const oldChipsPattern = /<!-- 6 Interactive Prompt Chips[\s\S]*?<!-- Chip 6: Write Story[\s\S]*?<\/button>\s*<\/div>/;

const newChipsPattern = `<!-- 4 Sleek Prompt Chips (Clean ChatGPT / Gemini style) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left pt-1">
            <button onclick="usePrompt('Explain how large language models and neural transformers work in simple terms.')" class="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group shadow-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">💡 Concept</span>
                <span class="text-slate-500 group-hover:text-cyan-400 transition-colors text-xs">↗</span>
              </div>
              <div class="text-xs font-semibold text-slate-200 group-hover:text-white transition line-clamp-1">Explain complex topic simply</div>
            </button>

            <button onclick="usePrompt('Help me write a modern, responsive website component using HTML and Tailwind CSS.')" class="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group shadow-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">💻 Coding</span>
                <span class="text-slate-500 group-hover:text-indigo-400 transition-colors text-xs">↗</span>
              </div>
              <div class="text-xs font-semibold text-slate-200 group-hover:text-white transition line-clamp-1">Build responsive web UI</div>
            </button>

            <button onclick="usePrompt('Can you review and debug this code snippet step by step?')" class="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group shadow-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">⚡ Debugging</span>
                <span class="text-slate-500 group-hover:text-emerald-400 transition-colors text-xs">↗</span>
              </div>
              <div class="text-xs font-semibold text-slate-200 group-hover:text-white transition line-clamp-1">Code review & bug fix</div>
            </button>

            <button onclick="usePrompt('Generate creative ideas and a step-by-step launch plan for an AI product.')" class="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group shadow-sm">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">🚀 Strategy</span>
                <span class="text-slate-500 group-hover:text-purple-400 transition-colors text-xs">↗</span>
              </div>
              <div class="text-xs font-semibold text-slate-200 group-hover:text-white transition line-clamp-1">Product roadmap & ideas</div>
            </button>
          </div>`;

if (oldChipsPattern.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldChipsPattern, newChipsPattern);
  console.log('Streamlined welcome screen prompt chips from 6 heavy cards to 4 clean pills');
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html successfully updated with clean UI and color inversion.');
