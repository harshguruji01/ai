import fs from 'node:fs';

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add CSS styles for Animated Orb, Waveform, and Mobile Navigation
const customStyles = `
    /* Advanced Voice Mode Orb Animations */
    @keyframes orbGlow {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 45px 15px rgba(99, 102, 241, 0.4), 0 0 90px 30px rgba(6, 182, 212, 0.25);
      }
      50% {
        transform: scale(1.08);
        box-shadow: 0 0 65px 25px rgba(99, 102, 241, 0.65), 0 0 120px 45px rgba(6, 182, 212, 0.4);
      }
    }

    @keyframes orbRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes waveBar {
      0%, 100% { height: 12px; }
      50% { height: 48px; }
    }

    .voice-orb {
      animation: orbGlow 3s ease-in-out infinite;
    }

    .voice-orb-inner {
      animation: orbRotate 12s linear infinite;
    }

    .wave-bar {
      animation: waveBar 1.2s ease-in-out infinite;
    }

    /* Strict Anti-Overflow Rules for Mobile & Desktop */
    html, body {
      width: 100%;
      height: 100%;
      height: 100vh;
      height: 100dvh;
      overflow: hidden !important;
      position: fixed;
      touch-action: pan-y;
      -webkit-tap-highlight-color: transparent;
    }

    #mainWorkspace {
      width: 100%;
      max-width: 100vw;
      min-width: 0;
      overflow-x: hidden !important;
    }

    #chatFeed {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      overflow-x: hidden !important;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .prose-ai pre, .prose-ai code {
      max-width: 100%;
      word-break: break-word;
    }

    .prose-ai table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      white-space: nowrap;
    }

    /* Modal & Sheet Slide Transitions */
    .sheet-up {
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
    }

    /* Safe Bottom Inset for Mobile Devices */
    .safe-bottom {
      padding-bottom: max(env(safe-area-inset-bottom, 0px), 0.5rem);
    }
`;

if (!html.includes('/* Advanced Voice Mode Orb Animations */')) {
  html = html.replace('</style>', `${customStyles}\n  </style>`);
}

// 2. Add Top-Right New Chat & Chat Actions buttons to Header
const targetHeaderRight = `<div class="flex items-center gap-2 sm:gap-3">`;
const replacementHeaderRight = `<div class="flex items-center gap-1.5 sm:gap-2.5">
          <!-- Mobile New Chat Button -->
          <button type="button" onclick="handleNewChat()" class="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/60 text-slate-200 hover:text-white transition" title="Start New Chat">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>

          <!-- Chat Actions Menu Trigger (⋮) -->
          <button type="button" onclick="openChatActionsSheet()" class="p-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-white transition" title="Chat Actions">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>`;

if (html.includes(targetHeaderRight) && !html.includes('openChatActionsSheet()')) {
  html = html.replace(targetHeaderRight, replacementHeaderRight);
}

// 3. Make Model Selector Pill trigger openModelPickerSheet() on click
html = html.replace(
  'id="modelSelectorBadge" title="AI Model: Guru-Flash 1.1">',
  'id="modelSelectorBadge" onclick="openModelPickerSheet()" title="AI Model: Guru-Flash 1.1 (Tap to switch)">'
);

// 4. Update the bottom Composer bar to dock above mobile nav
html = html.replace(
  `class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none pb-3 sm:pb-5 px-3 md:px-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent pt-8 flex-shrink-0 z-20"`,
  `class="absolute bottom-14 md:bottom-0 left-0 right-0 z-20 pointer-events-none pb-2 sm:pb-4 px-2 sm:px-4 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/95 to-transparent pt-6 flex-shrink-0 z-20"`
);

// 5. Add Voice Mode Button (Headphones) to composer toolbar
const targetComposerRight = `<!-- Send Button -->
                <button type="submit" id="sendBtn"`;

const replacementComposerRight = `<!-- Advanced Voice Mode Button (Headphones) -->
                <button type="button" onclick="openVoiceModeModal()" class="p-2 sm:p-2.5 rounded-full bg-slate-800/90 hover:bg-indigo-600/30 text-cyan-400 border border-slate-700/70 hover:border-cyan-400/50 shadow-sm transition active:scale-95" title="Open Advanced Voice Mode">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                </button>

                <!-- Send Button -->
                <button type="submit" id="sendBtn"`;

if (html.includes(targetComposerRight) && !html.includes('openVoiceModeModal()')) {
  html = html.replace(targetComposerRight, replacementComposerRight);
}

// 6. Add Mobile Bottom Navigation Bar right before closing </body>
const mobileBottomNavHtml = `
  <!-- MOBILE BOTTOM NAVIGATION BAR (ChatGPT Style) -->
  <nav id="mobileBottomNav" class="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] z-30 flex items-center justify-around px-2 backdrop-blur-lg">
    <!-- 1. History Drawer -->
    <button type="button" onclick="toggleSidebar(true)" class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-white transition py-1 px-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <span class="text-[10px] font-medium">Chats</span>
    </button>

    <!-- 2. Explore GPTs Store -->
    <button type="button" onclick="openExploreGptsModal()" class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-cyan-400 transition py-1 px-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
      </svg>
      <span class="text-[10px] font-medium">Explore</span>
    </button>

    <!-- 3. Elevated Advanced Voice Mode Trigger -->
    <button type="button" onclick="openVoiceModeModal()" class="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 border-2 border-[#0b0f19] transition-transform active:scale-95" title="Voice Mode">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
    </button>

    <!-- 4. Models Selector -->
    <button type="button" onclick="openModelPickerSheet()" class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-indigo-400 transition py-1 px-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span class="text-[10px] font-medium">Models</span>
    </button>

    <!-- 5. Settings Modal -->
    <button type="button" onclick="toggleModal(true)" class="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-white transition py-1 px-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-[10px] font-medium">Settings</span>
    </button>
  </nav>

  <!-- 6. MODEL SELECTOR BOTTOM SHEET (ChatGPT Style) -->
  <div id="modelPickerSheet" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300">
    <div class="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 text-slate-100 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold">⚡</div>
          <h3 class="font-bold font-heading text-sm text-white">Select AI Engine</h3>
        </div>
        <button type="button" onclick="closeModelPickerSheet()" class="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="space-y-2">
        <button type="button" onclick="selectAiModelFromSheet('guru-flash-1.1', 'Guru-Flash 1.1', false)" class="w-full flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-indigo-500/50 transition text-left group">
          <div class="text-xl">⚡</div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-xs group-hover:text-cyan-400">Guru-Flash 1.1 (Recommended)</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Everyday intelligence, coding, study & deep reasoning.</p>
          </div>
        </button>

        <button type="button" onclick="selectAiModelFromSheet('guru-flash-1.2', 'Guru-Flash 1.2', false)" class="w-full flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 transition text-left group">
          <div class="text-xl">🚀</div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-xs group-hover:text-cyan-400">Guru-Flash 1.2 (Qwen-27B)</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Ultra-Fast</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">High-speed inference for instant answers and summaries.</p>
          </div>
        </button>

        <button type="button" onclick="selectAiModelFromSheet('guru-flash-1.5', 'Guru-Flash 1.5 Pro', true, 'Starter Pro')" class="w-full flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 transition text-left group opacity-85">
          <div class="text-xl">🧠</div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200 text-xs">Guru-Flash 1.5 Pro</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Starter $5</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Expanded context and complex mathematical logic.</p>
          </div>
        </button>

        <button type="button" onclick="selectAiModelFromSheet('guru-vision-1.9', 'Guru-Vision 1.9', true, 'Power Scholar')" class="w-full flex items-start gap-3 p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 transition text-left group opacity-85">
          <div class="text-xl">🎨</div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200 text-xs">Guru-Vision 1.9 & SDXL</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Power $15</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Photorealistic 8K generative image artwork.</p>
          </div>
        </button>
      </div>

      <div class="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Permanent Creator Memory Active</span>
        <a href="https://webguruji.online/owner.html" target="_blank" class="text-cyan-400 hover:underline">HarshGuruJi ↗</a>
      </div>
    </div>
  </div>

  <!-- 7. CHAT ACTIONS BOTTOM SHEET (⋮ Menu) -->
  <div id="chatActionsSheet" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="w-full sm:max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 text-slate-100 shadow-2xl space-y-2">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800 px-2">
        <span class="font-bold text-xs text-slate-300">Chat Options</span>
        <button type="button" onclick="closeChatActionsSheet()" class="p-1 text-slate-400 hover:text-white">✕</button>
      </div>

      <button type="button" onclick="renameCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        <span>Rename Conversation</span>
      </button>

      <button type="button" onclick="shareCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
        <span>Share Conversation</span>
      </button>

      <button type="button" onclick="exportCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-left text-xs font-medium text-slate-200 transition">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        <span>Export as Markdown / Text</span>
      </button>

      <button type="button" onclick="deleteCurrentChatAction()" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-950/40 text-left text-xs font-medium text-rose-400 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        <span>Delete Conversation</span>
      </button>
    </div>
  </div>

  <!-- 8. ADVANCED VOICE MODE (FULLSCREEN IMMERSIVE LIKE CHATGPT) -->
  <div id="advancedVoiceModal" class="fixed inset-0 z-[60] bg-[#070b13] flex flex-col justify-between p-6 hidden select-none">
    <!-- Top Bar -->
    <div class="flex items-center justify-between text-slate-300">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
        <span class="font-heading font-bold text-white tracking-wide">GuruAI Voice Mode</span>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Guru-Flash 1.1</span>
      </div>
      <button type="button" onclick="closeVoiceModeModal()" class="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Center 3D Pulsing Animated Orb & Waves -->
    <div class="flex flex-col items-center justify-center space-y-8 my-auto">
      <div class="relative flex items-center justify-center">
        <!-- Glowing Ambient Rings -->
        <div class="absolute w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div class="absolute w-48 h-48 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none"></div>

        <!-- Animated Center Orb -->
        <div id="voiceOrbElement" class="voice-orb relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-500 to-purple-600 p-1 flex items-center justify-center shadow-2xl">
          <div class="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3">
            <img src="logo.png" alt="GuruAI" class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full voice-orb-inner" />
          </div>
        </div>
      </div>

      <div class="text-center space-y-2">
        <div id="voiceModeStatusText" class="text-lg font-bold text-white tracking-wide">Listening to you...</div>
        <p class="text-xs text-slate-400">Speak naturally in English, Hindi, or Hinglish</p>
      </div>

      <!-- Real-time Subtitle / Transcript Pill -->
      <div id="voiceModeTranscriptPill" class="max-w-md w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 text-center min-h-[44px] flex items-center justify-center">
        <span>Say "Hello GuruAI, how can you help me today?"</span>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="flex items-center justify-center gap-6 pb-4">
      <!-- Mute Mic Toggle -->
      <button type="button" id="voiceModeMuteBtn" onclick="toggleVoiceModeMute()" class="w-14 h-14 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg active:scale-95" title="Mute Microphone">
        <svg id="voiceModeMuteIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
      </button>

      <!-- End Voice Call (Red button) -->
      <button type="button" onclick="closeVoiceModeModal()" class="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/40 transition active:scale-95" title="End Voice Session">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 9. EXPLORE GPTS / ASSISTANT STORE MODAL -->
  <div id="exploreGptsModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-6">
    <div class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl flex flex-col max-h-[88vh]">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-lg font-bold font-heading text-white">Explore Specialized Assistants</h2>
          <p class="text-xs text-slate-400">Discover custom tools tuned for coding, learning & productivity</p>
        </div>
        <button type="button" onclick="closeExploreGptsModal()" class="p-1 rounded-xl text-slate-400 hover:text-white">✕</button>
      </div>

      <div class="py-4 overflow-y-auto space-y-3 flex-1 pr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Assistant 1 -->
          <div onclick="startSpecializedChat('code-mentor', 'You are an elite Code Mentor & Software Architect. Help me write clean, performant, and bug-free code.')" class="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/60 transition cursor-pointer group">
            <div class="text-2xl mb-2">💻</div>
            <div class="font-bold text-xs text-white group-hover:text-cyan-400">Code Mentor & Debugger</div>
            <p class="text-[11px] text-slate-400 mt-1">Full-stack development, algorithms, architecture reviews, and bug fixes.</p>
          </div>

          <!-- Assistant 2 -->
          <div onclick="startSpecializedChat('study-guru', 'You are my personal Study Guru & Exam Preparation Coach. Explain concepts simply and quiz me.')" class="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-400/60 transition cursor-pointer group">
            <div class="text-2xl mb-2">📚</div>
            <div class="font-bold text-xs text-white group-hover:text-indigo-400">Study & Exam Coach</div>
            <p class="text-[11px] text-slate-400 mt-1">Simplifies hard subjects, creates flashcards, and explains NCERT & engineering topics.</p>
          </div>

          <!-- Assistant 3 -->
          <div onclick="startSpecializedChat('image-studio', 'Generate photorealistic 8K artwork: ')" class="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-400/60 transition cursor-pointer group">
            <div class="text-2xl mb-2">🎨</div>
            <div class="font-bold text-xs text-white group-hover:text-purple-400">AI Image Studio (SDXL)</div>
            <p class="text-[11px] text-slate-400 mt-1">Transforms creative ideas into cinematic high-definition visual imagery.</p>
          </div>

          <!-- Assistant 4 -->
          <div onclick="startSpecializedChat('writer-copilot', 'You are a professional Creative Writer & Copywriter. Help me draft compelling content.')" class="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-400/60 transition cursor-pointer group">
            <div class="text-2xl mb-2">✍️</div>
            <div class="font-bold text-xs text-white group-hover:text-amber-400">Copywriter & Resume Builder</div>
            <p class="text-[11px] text-slate-400 mt-1">Writes high-converting copy, professional resumes, essays, and stories.</p>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-800 flex justify-end">
        <button type="button" onclick="closeExploreGptsModal()" class="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition">Close</button>
      </div>
    </div>
  </div>
`;

if (!html.includes('id="mobileBottomNav"')) {
  html = html.replace('</body>', `${mobileBottomNavHtml}\n</body>`);
}

// 7. Add Controller JS functions for Model Picker, Chat Actions, Voice Mode, and Explore GPTs
const customJsControllers = `
    // === CHATGPT MOBILE & WEB EXTENDED CONTROLLERS ===

    // 1. Model Picker Sheet Controller
    window.openModelPickerSheet = function() {
      const sheet = document.getElementById('modelPickerSheet');
      if (sheet) sheet.classList.remove('hidden');
    };

    window.closeModelPickerSheet = function() {
      const sheet = document.getElementById('modelPickerSheet');
      if (sheet) sheet.classList.add('hidden');
    };

    window.selectAiModelFromSheet = function(modelId, modelName, isLocked, tierName) {
      closeModelPickerSheet();
      selectAiModel(modelId, modelName, isLocked, tierName);
    };

    // 2. Chat Actions Bottom Sheet Controller
    window.openChatActionsSheet = function() {
      const sheet = document.getElementById('chatActionsSheet');
      if (sheet) sheet.classList.remove('hidden');
    };

    window.closeChatActionsSheet = function() {
      const sheet = document.getElementById('chatActionsSheet');
      if (sheet) sheet.classList.add('hidden');
    };

    window.renameCurrentChatAction = function() {
      closeChatActionsSheet();
      if (!currentConvId) {
        showToast('Start a conversation first to rename it.', 'info');
        return;
      }
      renameConversation(currentConvId);
    };

    window.shareCurrentChatAction = async function() {
      closeChatActionsSheet();
      const shareUrl = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'GuruAI Chat Assistant',
            text: 'Check out this AI conversation on GuruAI by HarshGuruJi!',
            url: shareUrl
          });
          return;
        } catch (e) {}
      }
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Chat link copied to clipboard! 📋', 'success');
      });
    };

    window.exportCurrentChatAction = function() {
      closeChatActionsSheet();
      if (!conversationHistory || conversationHistory.length === 0) {
        showToast('No messages to export.', 'info');
        return;
      }
      let exportText = '# GuruAI Conversation Export\\n\\n';
      exportText += 'Exported on: ' + new Date().toLocaleString() + '\\n';
      exportText += 'Model: ' + currentSelectedModel + '\\n\\n---\\n\\n';
      conversationHistory.forEach(msg => {
        exportText += '### ' + (msg.role === 'user' ? '👤 You' : '🤖 GuruAI') + ':\\n\\n' + msg.content + '\\n\\n---\\n\\n';
      });

      const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guruai-chat-' + Date.now() + '.md';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Conversation exported as Markdown file! 📥', 'success');
    };

    window.deleteCurrentChatAction = function() {
      closeChatActionsSheet();
      if (!currentConvId) return;
      deleteConversation(currentConvId);
    };

    // 3. Explore GPTs Modal Controller
    window.openExploreGptsModal = function() {
      const modal = document.getElementById('exploreGptsModal');
      if (modal) modal.classList.remove('hidden');
    };

    window.closeExploreGptsModal = function() {
      const modal = document.getElementById('exploreGptsModal');
      if (modal) modal.classList.add('hidden');
    };

    window.startSpecializedChat = function(type, initialPrompt) {
      closeExploreGptsModal();
      handleNewChat();
      promptInput.value = initialPrompt;
      promptInput.focus();
      showToast('Assistant loaded! Type your question to start.', 'info');
    };

    // 4. Advanced Fullscreen Voice Mode Controller
    let voiceModeActive = false;
    let voiceModeMuted = false;
    let voiceRecognition = null;

    window.openVoiceModeModal = function() {
      const modal = document.getElementById('advancedVoiceModal');
      if (modal) modal.classList.remove('hidden');
      voiceModeActive = true;
      voiceModeMuted = false;
      startVoiceModeRecognition();
    };

    window.closeVoiceModeModal = function() {
      const modal = document.getElementById('advancedVoiceModal');
      if (modal) modal.classList.add('hidden');
      voiceModeActive = false;
      if (voiceRecognition) {
        try { voiceRecognition.stop(); } catch(e){}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };

    window.toggleVoiceModeMute = function() {
      voiceModeMuted = !voiceModeMuted;
      const muteBtn = document.getElementById('voiceModeMuteBtn');
      const statusText = document.getElementById('voiceModeStatusText');
      if (voiceModeMuted) {
        if (muteBtn) muteBtn.classList.add('border-rose-500', 'text-rose-400');
        if (statusText) statusText.textContent = 'Microphone Muted';
        if (voiceRecognition) {
          try { voiceRecognition.stop(); } catch(e){}
        }
      } else {
        if (muteBtn) muteBtn.classList.remove('border-rose-500', 'text-rose-400');
        if (statusText) statusText.textContent = 'Listening to you...';
        startVoiceModeRecognition();
      }
    };

    function startVoiceModeRecognition() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        document.getElementById('voiceModeStatusText').textContent = 'Voice recognition not supported on this browser';
        return;
      }

      voiceRecognition = new SpeechRec();
      voiceRecognition.continuous = false;
      voiceRecognition.interimResults = true;
      voiceRecognition.lang = currentLang === 'hindi' ? 'hi-IN' : 'en-US';

      voiceRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const pill = document.getElementById('voiceModeTranscriptPill');
        if (pill) pill.innerHTML = '<span class="text-cyan-300 font-medium">"' + transcript + '"</span>';

        if (event.results[0].isFinal) {
          // Send recognized text as user prompt
          closeVoiceModeModal();
          promptInput.value = transcript;
          chatForm.dispatchEvent(new Event('submit'));
        }
      };

      voiceRecognition.onerror = (e) => {
        console.warn('Voice Mode Recognition Notice:', e);
      };

      voiceRecognition.onend = () => {
        if (voiceModeActive && !voiceModeMuted) {
          try { voiceRecognition.start(); } catch(e){}
        }
      };

      try {
        voiceRecognition.start();
      } catch (err) {
        console.warn('Recognition start notice:', err);
      }
    }
`;

if (!html.includes('// === CHATGPT MOBILE & WEB EXTENDED CONTROLLERS ===')) {
  html = html.replace('// 1. Supabase Initialization', `${customJsControllers}\n    // 1. Supabase Initialization`);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully upgraded index.html with complete ChatGPT Mobile & Web UI architecture!');
