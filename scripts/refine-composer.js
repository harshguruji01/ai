import fs from 'node:fs';

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Ensure composerModelSelectorWrap is hidden on mobile (< 640px) to prevent button crowding
html = html.replace(
  'id="composerModelSelectorWrap">',
  'id="composerModelSelectorWrap" class="relative hidden sm:inline-block text-left">'
);

// 2. In imageModeBtn, make text hidden on extra-small mobile, visible on sm
html = html.replace(
  '<span>Image Studio</span>',
  '<span class="hidden sm:inline">Image Studio</span>'
);

// 3. Make langBadgeBtn and headerUpgradeBtn hidden on xs, flex on sm
html = html.replace(
  'id="langBadgeBtn"\n            class="text-xs px-2.5 py-1 rounded-full',
  'id="langBadgeBtn"\n            class="hidden sm:flex text-xs px-2.5 py-1 rounded-full'
);
html = html.replace(
  'id="headerUpgradeBtn" onclick="openUpgradeModal()"\n            class="flex items-center gap-1.5 px-3 py-1 rounded-full',
  'id="headerUpgradeBtn" onclick="openUpgradeModal()"\n            class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full'
);
html = html.replace(
  'id="headerQuotaBadge"\n            class="flex items-center gap-1.5 px-3 py-1 rounded-full',
  'id="headerQuotaBadge"\n            class="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full'
);

// 4. Also add a Regenerate button to format assistant responses
if (!html.includes('window.regenerateLastResponse')) {
  const regenFunc = `
    window.regenerateLastResponse = function() {
      if (conversationHistory.length === 0 || isGenerating) return;
      // Find last user message
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        if (conversationHistory[i].role === 'user') {
          const lastUserPrompt = conversationHistory[i].content;
          // Pop everything after
          conversationHistory = conversationHistory.slice(0, i + 1);
          renderConversationMessages();
          streamResponse(lastUserPrompt);
          break;
        }
      }
    };
  `;
  html = html.replace('// === CHATGPT MOBILE & WEB EXTENDED CONTROLLERS ===', `// === CHATGPT MOBILE & WEB EXTENDED CONTROLLERS ===\n${regenFunc}`);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully adjusted mobile responsive rules in index.html!');
