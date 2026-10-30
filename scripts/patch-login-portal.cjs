const fs = require('fs');

let loginHtml = fs.readFileSync('login.html', 'utf8');

// Add performPostLoginRedirect function
const helperFunction = `    function performPostLoginRedirect(session) {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source');
      let redirectTarget = urlParams.get('redirect') || urlParams.get('return_to') || 'https://ai.webguruji.online/';
      if (redirectTarget.includes('login.html') || redirectTarget === 'https://webguruji.online/dashboard.html') {
        redirectTarget = 'https://ai.webguruji.online/';
      }

      // App redirect (when user initiated login from native mobile app)
      if (source === 'app' || redirectTarget.startsWith('online.webguruji.ai') || redirectTarget.startsWith('guruai')) {
        const tokenHash = session ? \`#access_token=\${encodeURIComponent(session.access_token)}&refresh_token=\${encodeURIComponent(session.refresh_token)}&token_type=bearer\` : '';
        const appDeepLink = (redirectTarget.startsWith('online.webguruji.ai') || redirectTarget.startsWith('guruai'))
          ? (redirectTarget + (redirectTarget.includes('#') ? '&' : '#') + tokenHash.replace(/^#/, ''))
          : (\`online.webguruji.ai://login-callback\` + tokenHash);

        showAlert('success', 'Logged in successfully! Returning to GuruAI App...');
        
        let appBox = document.getElementById('loginAppReturnBox');
        if (!appBox) {
          appBox = document.createElement('div');
          appBox.id = 'loginAppReturnBox';
          const container = document.querySelector('form') || document.body;
          if (container && container.parentNode) {
            container.parentNode.insertBefore(appBox, container.nextSibling);
          }
        }
        if (appBox) {
          appBox.innerHTML = \`
            <div class="mt-4 p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 text-center shadow-xl animate-in fade-in">
              <p class="text-xs text-indigo-200 mb-2 font-medium">Logged in successfully! Tap below to open GuruAI App:</p>
              <a href="\${appDeepLink}" class="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-90 transition">
                <span>Open GuruAI App</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
            </div>
          \`;
        }

        setTimeout(() => {
          window.location.href = appDeepLink;
        }, 500);
        return;
      }

      // Web AI Hub redirect (when user logged in from ai.webguruji.online)
      if (session && (redirectTarget.includes('ai.webguruji.online') || redirectTarget === 'index.html' || redirectTarget.endsWith('/'))) {
        const hashChar = redirectTarget.includes('#') ? '&' : '#';
        redirectTarget = redirectTarget + hashChar + \`access_token=\${encodeURIComponent(session.access_token)}&refresh_token=\${encodeURIComponent(session.refresh_token)}&token_type=bearer\`;
      }

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    }
`;

// Insert performPostLoginRedirect before loginForm.onsubmit
const loginFormStart = `    // Step 1: User submits email & password -> Send 6-digit OTP from info@webguruji.online\n    loginForm.onsubmit = async (e) => {`;
if (loginHtml.includes(loginFormStart)) {
  loginHtml = loginHtml.replace(loginFormStart, helperFunction + '\n' + loginFormStart);
} else {
  console.log('loginFormStart pattern not found with exact newlines, checking normalized...');
  loginHtml = loginHtml.replace(/(\/\/\s*Step 1: User submits email[\s\S]*?loginForm\.onsubmit\s*=\s*async\s*\(e\)\s*=>\s*\{)/, helperFunction + '\n$1');
}

// Update loginForm.onsubmit redirect
const oldLoginRedirect = `        showAlert('success', 'Signed in successfully! Redirecting to GuruAI...');
        const urlParams = new URLSearchParams(window.location.search);
        let redirectTarget = urlParams.get('redirect') || 'dashboard.html';
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 500);`;

const newLoginRedirect = `        showAlert('success', 'Signed in successfully! Redirecting to GuruAI...');
        performPostLoginRedirect(data?.session);`;

loginHtml = loginHtml.replace(oldLoginRedirect, newLoginRedirect);

// Update btnLoginVerifyOtp redirect
const oldOtpRedirect = `        const urlParams = new URLSearchParams(window.location.search);
        let targetRedirect = urlParams.get('redirect') || urlParams.get('return_to') || 'index.html';
        if (targetRedirect.includes('login.html') || targetRedirect === 'https://webguruji.online/dashboard.html') {
          targetRedirect = 'index.html';
        }
        setTimeout(() => { window.location.href = targetRedirect; }, 600);`;

const newOtpRedirect = `        const sessionRes = await supabase.auth.getSession();
        performPostLoginRedirect(sessionRes?.data?.session);`;

loginHtml = loginHtml.replace(oldOtpRedirect, newOtpRedirect);

// Update Google OAuth in login.html
const oldGoogleOAuth = `        const redirectTo = 'https://ai.webguruji.online/';
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        });`;

const newGoogleOAuth = `        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        const customRedirect = urlParams.get('redirect');
        let redirectTo = 'https://ai.webguruji.online/';
        if (source === 'app' || (customRedirect && (customRedirect.startsWith('online.webguruji.ai') || customRedirect.startsWith('guruai')))) {
          redirectTo = 'online.webguruji.ai://login-callback';
        }
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        });`;

loginHtml = loginHtml.replace(oldGoogleOAuth, newGoogleOAuth);

fs.writeFileSync('login.html', loginHtml, 'utf8');
fs.writeFileSync('public/login.html', loginHtml, 'utf8');
if (fs.existsSync('www/login.html')) {
  fs.writeFileSync('www/login.html', loginHtml, 'utf8');
}
console.log('login.html updated and synced to public/ and www/');
