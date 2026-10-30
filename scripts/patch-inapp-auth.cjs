const fs = require('fs');
const path = require('path');

// 1. Patch index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace openAuthModal with app-aware logic
const oldAuthPattern = /function openAuthModal\(mode = 'login'\) \{[\s\S]*?authModal\.classList\.remove\('hidden'\);\s*\}/;

const newAuthLogic = `function isNativeAppEnvironment() {
      return !!(
        (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ||
        (typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:')) ||
        (typeof navigator !== 'undefined' && navigator.userAgent && (navigator.userAgent.includes('GuruAI') || navigator.userAgent.includes('Capacitor')))
      );
    }

    function openAuthModal(mode = 'login') {
      const isApp = isNativeAppEnvironment();

      if (currentUser) {
        setAuthModalMode('profile');
        authModal.classList.remove('hidden');
        return;
      }

      // If running inside Android Native APK / Capacitor:
      // STAY 100% inside the app! Show the sleek in-app Auth modal directly.
      // The user signs in directly within the app, their credentials/tokens are saved in local storage,
      // and they are NEVER redirected out to a browser!
      if (isApp) {
        setAuthModalMode(mode);
        authModal.classList.remove('hidden');
        const appWebLink = document.getElementById('appWebLoginLinkContainer');
        if (appWebLink) appWebLink.classList.remove('hidden');
        return;
      }

      // If on Web (ai.webguruji.online):
      // Redirect to unified login portal which redirects back to https://ai.webguruji.online/
      try {
        const hostname = window.location.hostname;
        let domainStr = (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) ? '; domain=.webguruji.online' : '';
        const secureStr = window.location.protocol === 'https:' ? '; secure' : '';
        document.cookie = \`hg_auth_redirect=\${encodeURIComponent('https://ai.webguruji.online/')}; path=/; max-age=3600\${domainStr}; SameSite=Lax\${secureStr}\`;
      } catch(e) {}

      window.location.href = 'https://login.webguruji.online/?redirect=' + encodeURIComponent('https://ai.webguruji.online/') + '&source=ai';
    }`;

if (oldAuthPattern.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldAuthPattern, newAuthLogic);
  console.log('Successfully replaced openAuthModal in index.html');
} else {
  console.error('Failed to match openAuthModal pattern in index.html');
  process.exit(1);
}

// Update Google OAuth in index.html to support app redirect
const oldGoogleOAuth = `    // Google Sign-In
    document.querySelectorAll('.googleOAuthBtn').forEach(btn => {
      btn.onclick = async () => {
        if (!supabaseClient) return showAuthAlert('error', 'Supabase not initialized');
        showAuthAlert('clear', '');
        try {
          const hostname = window.location.hostname;
          let domainStr = (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) ? '; domain=.webguruji.online' : '';
          const secureStr = window.location.protocol === 'https:' ? '; secure' : '';
          document.cookie = \`hg_auth_redirect=\${encodeURIComponent('https://ai.webguruji.online/')}; path=/; max-age=3600\${domainStr}; SameSite=Lax\${secureStr}\`;
        } catch(e) {}
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: 'https://ai.webguruji.online/' }
        });
        if (error) showAuthAlert('error', error.message);
      };
    });`;

const newGoogleOAuth = `    // Google Sign-In
    document.querySelectorAll('.googleOAuthBtn').forEach(btn => {
      btn.onclick = async () => {
        if (!supabaseClient) return showAuthAlert('error', 'Supabase not initialized');
        showAuthAlert('clear', '');
        const isApp = isNativeAppEnvironment();
        const redirectTo = isApp ? 'online.webguruji.ai://login-callback' : 'https://ai.webguruji.online/';
        try {
          const hostname = window.location.hostname;
          let domainStr = (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) ? '; domain=.webguruji.online' : '';
          const secureStr = window.location.protocol === 'https:' ? '; secure' : '';
          document.cookie = \`hg_auth_redirect=\${encodeURIComponent(redirectTo)}; path=/; max-age=3600\${domainStr}; SameSite=Lax\${secureStr}\`;
        } catch(e) {}
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo }
        });
        if (error) showAuthAlert('error', error.message);
      };
    });`;

if (indexHtml.includes(oldGoogleOAuth)) {
  indexHtml = indexHtml.replace(oldGoogleOAuth, newGoogleOAuth);
  console.log('Successfully updated Google OAuth in index.html');
} else {
  console.log('Google OAuth block already customized or differs; checking...');
}

// Update loginForm submit handler to close modal and toast smoothly
const oldLoginSuccess = `        showAuthAlert('success', 'Signed in successfully!');
        updateUserState(data.user);`;

const newLoginSuccess = `        showAuthAlert('success', 'Signed in successfully!');
        updateUserState(data.user);
        setTimeout(() => {
          closeAuthModal();
          if (typeof showToast === 'function') {
            showToast('Welcome back, ' + (data.user?.email || 'GuruAI user') + '! 👋', 'success');
          }
        }, 500);`;

if (indexHtml.includes(oldLoginSuccess)) {
  indexHtml = indexHtml.replace(oldLoginSuccess, newLoginSuccess);
  console.log('Updated loginForm success callback in index.html');
}

// Enhance Session & Deep Link Listener in index.html
const oldSessionListener = `    // Session Listener
    if (supabaseClient) {
      if (window.location.hash && window.location.hash.includes('access_token=')) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const access_token = hashParams.get('access_token');
          const refresh_token = hashParams.get('refresh_token');
          if (access_token && refresh_token) {
            supabaseClient.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
              if (!error && data?.session) {
                updateUserState(data.session.user);
                showToast('Logged in successfully!', 'success');
              }
            });
            const cleanUrl = window.location.pathname + window.location.search;
            history.replaceState(null, document.title, cleanUrl);
          }
        } catch (e) {
          console.warn('Error ingesting hash tokens:', e);
        }
      }

      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateUserState(session?.user || null);
      });
      supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUserState(session?.user || null);
      });
    } else {
      updateUserState(null);
    }`;

const newSessionListener = `    // Deep Link & Auth Token Handler
    async function handleAuthTokensFromUrl(rawUrlOrHash) {
      if (!rawUrlOrHash || !supabaseClient) return;
      try {
        let hashOrSearch = '';
        if (rawUrlOrHash.includes('#')) {
          hashOrSearch = rawUrlOrHash.split('#')[1];
        } else if (rawUrlOrHash.includes('?')) {
          hashOrSearch = rawUrlOrHash.split('?')[1];
        } else {
          hashOrSearch = rawUrlOrHash;
        }
        const params = new URLSearchParams(hashOrSearch);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error } = await supabaseClient.auth.setSession({ access_token, refresh_token });
          if (!error && data?.session) {
            updateUserState(data.session.user);
            if (typeof showToast === 'function') {
              showToast('Logged in successfully! Welcome to GuruAI. 🎉', 'success');
            }
            if (authModal) authModal.classList.add('hidden');
          }
        }
      } catch (err) {
        console.warn('Error ingesting deep link auth tokens:', err);
      }
    }

    // Capacitor App URL Open listener for deep linking (online.webguruji.ai://)
    try {
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('appUrlOpen', (event) => {
          if (event && event.url) {
            console.log('GuruAI deep link opened:', event.url);
            handleAuthTokensFromUrl(event.url);
          }
        });
      }
    } catch(e) {
      console.warn('Capacitor App listener initialization:', e);
    }

    // Session Listener
    if (supabaseClient) {
      if (window.location.hash && window.location.hash.includes('access_token=')) {
        handleAuthTokensFromUrl(window.location.hash);
        try {
          const cleanUrl = window.location.pathname + window.location.search;
          history.replaceState(null, document.title, cleanUrl);
        } catch (e) {}
      } else if (window.location.search && window.location.search.includes('access_token=')) {
        handleAuthTokensFromUrl(window.location.search);
        try {
          const cleanUrl = window.location.pathname;
          history.replaceState(null, document.title, cleanUrl);
        } catch (e) {}
      }

      window.addEventListener('hashchange', () => {
        if (window.location.hash && window.location.hash.includes('access_token=')) {
          handleAuthTokensFromUrl(window.location.hash);
        }
      });

      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateUserState(session?.user || null);
      });
      supabaseClient.auth.onAuthStateChange((event, session) => {
        updateUserState(session?.user || null);
      });
    } else {
      updateUserState(null);
    }`;

if (indexHtml.includes(oldSessionListener)) {
  indexHtml = indexHtml.replace(oldSessionListener, newSessionListener);
  console.log('Updated Session & Deep Link Listener in index.html');
}

// Add optional web browser login helper link in #loginForm
if (!indexHtml.includes('id="appWebLoginLinkContainer"')) {
  const formEndPattern = `</button>\n\n        <div class="relative my-3">`;
  const replacementWithWebLink = `</button>
        <div id="appWebLoginLinkContainer" class="text-center pt-1 hidden">
          <a href="https://login.webguruji.online/?redirect=online.webguruji.ai%3A%2F%2Flogin-callback&source=app" target="_system" class="text-[11px] text-slate-400 hover:text-indigo-300 underline transition">
            Sign in using external browser (SSO)
          </a>
        </div>\n\n        <div class="relative my-3">`;
  if (indexHtml.includes(formEndPattern)) {
    indexHtml = indexHtml.replace(formEndPattern, replacementWithWebLink);
    console.log('Added appWebLoginLinkContainer in index.html');
  }
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html updated successfully.');
