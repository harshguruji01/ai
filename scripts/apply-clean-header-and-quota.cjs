const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Declutter Header: Move extra items to Menu
const oldHeaderSnippet = `          <!-- Language Tag Indicator -->
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

const newHeaderSnippet = `          <!-- Hidden compatible elements (clean UI: moved into ⋮ Menu & Dynamic Quota Pill) -->
          <button id="langBadgeBtn" class="hidden" aria-hidden="true"><span id="currentLangDisplay">English</span></button>
          <button id="headerUpgradeBtn" class="hidden" onclick="openUpgradeModal()" aria-hidden="true"></button>
          <button id="headerQuotaBadge"
            class="hidden items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-sm transition animate-in fade-in">
            <span id="headerQuotaText"></span>
            <span class="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-200 hidden" id="headerTierText">Guest</span>
          </button>`;

const normContent = content.replace(/\r\n/g, '\n');
const normOldSnippet = oldHeaderSnippet.replace(/\r\n/g, '\n');

if (normContent.includes(normOldSnippet)) {
  let updated = normContent.replace(normOldSnippet, newHeaderSnippet);

  // 2. Enrich chatActionsSheet with moved items
  const oldSheetTarget = `      <button type="button" onclick="renameCurrentChatAction()"`;
  const newSheetAdditions = `      <!-- Upgrade Plan in Menu -->
      <button type="button" onclick="openUpgradeModal(); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-300 hover:from-amber-500/25 hover:to-purple-500/25 transition text-left group">
        <div class="flex items-center gap-2.5">
          <span class="text-base">⭐</span>
          <div>
            <div class="text-xs font-bold text-white group-hover:text-amber-200">Upgrade Plan & Limits</div>
            <div class="text-[10px] text-slate-400">Unlock Flagship Guru-Ultra 2.0 & Image Studio</div>
          </div>
        </div>
        <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">PRO</span>
      </button>

      <!-- Quick Theme Switcher in Menu -->
      <button type="button" onclick="toggleThemeAction(); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <div class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <span>Switch Theme (Dark / Light)</span>
        </div>
        <span id="menuThemeIndicator" class="text-[10px] font-mono text-cyan-400 uppercase">Dark</span>
      </button>

      <!-- Language Selector in Menu -->
      <button type="button" onclick="toggleModal(true); closeChatActionsSheet();" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <div class="flex items-center gap-2.5">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
          <span>Language Preferences</span>
        </div>
        <span class="text-[10px] font-mono text-cyan-400 uppercase">Change</span>
      </button>

      <button type="button" onclick="renameCurrentChatAction()"`;

  if (updated.includes(oldSheetTarget)) {
    updated = updated.replace(oldSheetTarget, newSheetAdditions);
    console.log('Enriched ⋮ Menu Sheet with Upgrade, Theme, and Language');
  }

  // 3. Update updateQuotaUI to hide when > 3, show 'Remaining limit: X' when <= 3
  const oldQuotaTarget = `    function updateQuotaUI() {
      document.getElementById('quotaSidebarText').textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;
      document.getElementById('headerQuotaText').textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;
      document.getElementById('footerQuotaText').textContent = \`\${remainingAllowance} requests left\`;
    }`;

  const newQuotaTarget = `    function updateQuotaUI() {
      const quotaSidebarEl = document.getElementById('quotaSidebarText');
      if (quotaSidebarEl) quotaSidebarEl.textContent = \`\${remainingAllowance}/\${maxRequests} Left\`;

      const headerQuotaBadge = document.getElementById('headerQuotaBadge');
      const headerQuotaText = document.getElementById('headerQuotaText');
      const footerQuotaText = document.getElementById('footerQuotaText');

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
          footerQuotaText.className = 'font-mono text-amber-400 font-semibold text-[11px] animate-pulse';
        }
      } else if (remainingAllowance <= 0) {
        if (headerQuotaBadge) {
          headerQuotaBadge.classList.remove('hidden');
          headerQuotaBadge.classList.add('flex');
          if (headerQuotaText) headerQuotaText.textContent = 'Daily limit reached';
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
      }
    }`;

  if (updated.includes(oldQuotaTarget)) {
    updated = updated.replace(oldQuotaTarget, newQuotaTarget);
    console.log('Successfully updated updateQuotaUI with threshold 3 logic');
  }

  // Restore CRLF if needed
  if (content.includes('\r\n')) {
    updated = updated.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync('index.html', updated, 'utf8');
  console.log('Successfully updated index.html with clean header and quota rules');
} else {
  console.error('Could not find normOldSnippet in normalized index.html');
  process.exit(1);
}
