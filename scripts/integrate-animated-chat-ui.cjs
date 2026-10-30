const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// =========================================================================
// 1. ADD ATMOSPHERIC GLOW KEYFRAMES & BACKGROUND
// =========================================================================
if (!indexHtml.includes('id="ambientGlowBg"')) {
  const glowMarkup = `  <!-- Atmospheric Glowing Blurred Orbs (from Animated AI Chat UI) -->
  <div id="ambientGlowBg" class="pointer-events-none fixed inset-0 overflow-hidden z-0">
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" style="animation-delay: 700ms;"></div>
    <div class="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse" style="animation-delay: 1000ms;"></div>
  </div>\n\n`;

  indexHtml = indexHtml.replace('<body class="h-[100dvh] flex flex-col', glowMarkup + '  <body class="h-[100dvh] flex flex-col');
  console.log('Added ambientGlowBg');
}

// =========================================================================
// 2. REVISE CHATBAR MARKUP TO 100% MATCH ANIMATED-AI-CHAT.TSX
// =========================================================================
const oldComposerRegex = /<form id="chatForm"[\s\S]*?<\/form>/;

const newComposerMarkup = `<form id="chatForm"
            class="relative rounded-2xl border transition-all duration-200 backdrop-blur-2xl bg-white/[0.03] dark:bg-white/[0.02] border-white/[0.08] dark:border-white/[0.05] shadow-2xl focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/40">
            
            <!-- Command Palette Dropdown (Triggered by / or ⌘ button) -->
            <div id="commandPalette" class="hidden absolute left-3 right-3 bottom-full mb-2 backdrop-blur-xl bg-slate-950/95 border border-white/10 rounded-xl z-50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div class="p-1.5 space-y-0.5">
                <button type="button" onclick="selectCommandPrompt('/clone', 'Clone UI - Generate UI from screenshot')" class="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition group text-left">
                  <div class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <div>
                      <div class="font-medium text-white">Clone UI</div>
                      <div class="text-[10px] text-white/40">Generate a UI from a screenshot</div>
                    </div>
                  </div>
                  <span class="font-mono text-[10px] text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded">/clone</span>
                </button>
                <button type="button" onclick="selectCommandPrompt('/figma', 'Import Figma - Import design from Figma')" class="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition group text-left">
                  <div class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                    <div>
                      <div class="font-medium text-white">Import Figma</div>
                      <div class="text-[10px] text-white/40">Import a design from Figma</div>
                    </div>
                  </div>
                  <span class="font-mono text-[10px] text-fuchsia-300 bg-fuchsia-500/20 px-1.5 py-0.5 rounded">/figma</span>
                </button>
                <button type="button" onclick="selectCommandPrompt('/page', 'Create Page - Generate a new web page')" class="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition group text-left">
                  <div class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <div>
                      <div class="font-medium text-white">Create Page</div>
                      <div class="text-[10px] text-white/40">Generate a new web page with responsive HTML</div>
                    </div>
                  </div>
                  <span class="font-mono text-[10px] text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">/page</span>
                </button>
                <button type="button" onclick="selectCommandPrompt('/improve', 'Improve UI - Improve existing design')" class="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition group text-left">
                  <div class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                    <div>
                      <div class="font-medium text-white">Improve</div>
                      <div class="text-[10px] text-white/40">Improve existing UI design & animation</div>
                    </div>
                  </div>
                  <span class="font-mono text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">/improve</span>
                </button>
              </div>
            </div>

            <!-- Auto-resize Textarea Input (from Animated AI Chat) -->
            <div class="p-3 sm:p-4">
              <textarea id="promptInput" rows="1" placeholder="Ask GuruAI a question... (Type / for commands)"
                class="w-full px-2 sm:px-3 py-1.5 resize-none bg-transparent border-none text-[14px] leading-relaxed text-white/90 placeholder-white/30 focus:outline-none min-h-[52px] max-h-44 disabled:opacity-60"></textarea>
            </div>

            <!-- In-Capsule Attachments Chip Container -->
            <div id="attachmentChipContainer" class="hidden px-4 pb-2.5 flex gap-2 flex-wrap">
              <div class="inline-flex items-center gap-2 text-xs bg-white/[0.04] py-1 px-3 rounded-lg text-white/80 border border-white/10">
                <span id="attachmentFileName" class="truncate max-w-xs font-mono">file.pdf</span>
                <button type="button" id="removeAttachmentBtn" class="text-white/40 hover:text-white transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Bottom Action Toolbar (from Animated AI Chat) -->
            <div class="px-3 sm:px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <div class="flex items-center gap-1 sm:gap-2">
                <!-- Paperclip Attachment Input & Button -->
                <input type="file" id="fileAttachmentInput" class="hidden" accept="image/*,.txt,.pdf,.json,.csv" />
                <button type="button" id="attachFileBtn"
                  class="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
                  title="Attach File">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <!-- Command Palette Button (⌘) -->
                <button type="button" id="commandPaletteBtn"
                  class="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
                  title="Commands (/)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                <!-- Voice Dictation / Speech-to-Text Button -->
                <button type="button" id="voiceDictationBtn"
                  class="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors"
                  title="Voice Input (Speech-to-Text)">
                  <svg id="micIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <!-- Image Studio Button -->
                <button type="button" id="imageModeBtn"
                  class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 transition"
                  title="Toggle AI Image Generation Mode">
                  <svg class="w-3.5 h-3.5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="hidden sm:inline">Image</span>
                  <svg id="imageLockIcon" class="w-3 h-3 text-amber-400 ml-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              </div>

              <div class="flex items-center gap-2">
                <!-- Stop Generation Button -->
                <button type="button" id="stopGenBtn"
                  class="hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <span>Stop</span>
                </button>

                <!-- Send Button (from Animated AI Chat) -->
                <button type="submit" id="sendBtn"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-white text-[#0A0A0B] shadow-lg shadow-white/10 hover:opacity-95 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send Message">
                  <svg id="sendBtnIcon" class="w-4 h-4 fill-none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>`;

if (oldComposerRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldComposerRegex, newComposerMarkup);
  console.log('Successfully replaced chatForm with animated-ai-chat.tsx design');
} else {
  console.warn('oldComposerRegex did not match directly');
}

// =========================================================================
// 3. ADD FLOATING THINKING PILL
// =========================================================================
if (!indexHtml.includes('id="aiThinkingPill"')) {
  const thinkingPillMarkup = `  <!-- Floating Thinking Indicator (from Animated AI Chat) -->
  <div id="aiThinkingPill" class="hidden fixed bottom-24 md:bottom-20 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-slate-950/90 border border-white/10 rounded-full px-4 py-1.5 shadow-2xl z-30 flex items-center gap-3 animate-in fade-in duration-200">
    <div class="w-6 h-6 rounded-full bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
      <span>Guru</span>
    </div>
    <div class="flex items-center gap-2 text-xs text-slate-300">
      <span>Thinking</span>
      <span class="flex items-center gap-0.5 ml-1">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style="animation-delay: 150ms;"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style="animation-delay: 300ms;"></span>
      </span>
    </div>
  </div>\n`;

  indexHtml = indexHtml.replace('</body>', thinkingPillMarkup + '</body>');
  console.log('Added aiThinkingPill');
}

// =========================================================================
// 4. ADD COMMAND PALETTE EVENT LISTENERS & PROMPT HANDLERS
// =========================================================================
const commandScript = `
    // Command Palette Logic (from Animated AI Chat)
    const commandPalette = document.getElementById('commandPalette');
    const commandPaletteBtn = document.getElementById('commandPaletteBtn');

    function toggleCommandPalette(force) {
      if (!commandPalette) return;
      const isHidden = commandPalette.classList.contains('hidden');
      const show = force !== undefined ? force : isHidden;
      if (show) {
        commandPalette.classList.remove('hidden');
      } else {
        commandPalette.classList.add('hidden');
      }
    }

    if (commandPaletteBtn) {
      commandPaletteBtn.onclick = (e) => {
        e.stopPropagation();
        toggleCommandPalette();
      };
    }

    document.addEventListener('click', (e) => {
      if (commandPalette && !commandPalette.contains(e.target) && e.target !== commandPaletteBtn) {
        toggleCommandPalette(false);
      }
    });

    function selectCommandPrompt(prefix, label) {
      toggleCommandPalette(false);
      promptInput.value = prefix + ' ';
      promptInput.focus();
      promptInput.dispatchEvent(new Event('input'));
      if (typeof showToast === 'function') {
        showToast('Selected: ' + label, 'info');
      }
    }
    window.selectCommandPrompt = selectCommandPrompt;

    // Detect '/' in textarea
    promptInput.addEventListener('keyup', (e) => {
      if (promptInput.value.startsWith('/') && !promptInput.value.includes(' ')) {
        toggleCommandPalette(true);
      } else if (e.key === 'Escape' || !promptInput.value.startsWith('/')) {
        toggleCommandPalette(false);
      }
    });
`;

if (!indexHtml.includes('function selectCommandPrompt(')) {
  indexHtml = indexHtml.replace('// Auto-Resize Textarea', commandScript + '\n    // Auto-Resize Textarea');
  console.log('Added Command Palette listeners');
}

// Update thinking indicator visibility in start/stop generation
const oldTypingStart = `showTypingIndicator();`;
const newTypingStart = `showTypingIndicator();
      const thinkingPill = document.getElementById('aiThinkingPill');
      if (thinkingPill) thinkingPill.classList.remove('hidden');`;

if (indexHtml.includes(oldTypingStart)) {
  indexHtml = indexHtml.replace(oldTypingStart, newTypingStart);
}

const oldTypingEnd = `hideTypingIndicator();`;
const newTypingEnd = `hideTypingIndicator();
      const thinkingPill = document.getElementById('aiThinkingPill');
      if (thinkingPill) thinkingPill.classList.add('hidden');`;

if (indexHtml.includes(oldTypingEnd)) {
  indexHtml = indexHtml.replaceAll(oldTypingEnd, newTypingEnd);
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html successfully updated with Animated AI Chatbar and Theme.');
