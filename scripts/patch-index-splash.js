import fs from 'node:fs';

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
let normalized = html.replace(/\r\n/g, '\n');

// 1. Add Splash Screen overlay right after body
const splashHtml = `
  <!-- APP SPLASH SCREEN OVERLAY (Auto-fades on load) -->
  <div id="appSplashScreen" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0f19] transition-opacity duration-500 pointer-events-none">
    <div class="flex flex-col items-center">
      <div class="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/30 border border-indigo-500/30 animate-pulse">
        <img src="logo.png" alt="GuruAI Mascot" class="w-full h-full object-cover" />
      </div>
      <div class="mt-5 flex items-center gap-2">
        <span class="text-2xl font-bold font-heading text-white tracking-wide">GuruAI</span>
        <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">v1.1</span>
      </div>
      <div class="mt-2 text-xs text-slate-400 font-medium tracking-wider">Fast • Intelligent • By HarshGuruJi</div>
    </div>
  </div>
`;

if (!normalized.includes('id="appSplashScreen"')) {
  normalized = normalized.replace(
    '<body class="h-screen w-screen overflow-hidden flex flex-col font-sans-mode text-size-medium select-none">',
    `<body class="h-screen w-screen overflow-hidden flex flex-col font-sans-mode text-size-medium select-none">\n${splashHtml}`
  );
}

// 2. Add splash dismiss script
const dismissScript = `
    // Auto-dismiss App Splash Screen
    window.addEventListener('load', () => {
      setTimeout(() => {
        const splash = document.getElementById('appSplashScreen');
        if (splash) {
          splash.style.opacity = '0';
          setTimeout(() => splash.remove(), 550);
        }
      }, 400);
    });
`;

if (!normalized.includes('// Auto-dismiss App Splash Screen')) {
  normalized = normalized.replace(
    '// 1. Supabase Initialization',
    `${dismissScript}\n    // 1. Supabase Initialization`
  );
}

// 3. Fix mail send endpoint in index.html line 1454
normalized = normalized.replace(
  "await fetch('/api/mail/send'",
  "const mailApi = (window.location.protocol === 'https:' && window.location.origin.includes('webguruji.online')) ? '/api/mail/send' : 'https://ai.webguruji.online/api/mail/send';\n        await fetch(mailApi"
);

if (isCrlf) {
  normalized = normalized.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', normalized, 'utf8');
console.log('index.html splash & mail updated successfully!');
