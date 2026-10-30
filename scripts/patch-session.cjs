const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `    // Session Listener
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

const replacementStr = `    // Deep Link & Auth Token Ingestion
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
              showToast('Logged into GuruAI successfully! 🎉', 'success');
            }
            if (authModal) authModal.classList.add('hidden');
          }
        }
      } catch (err) {
        console.warn('Error ingesting deep link auth tokens:', err);
      }
    }

    // Capacitor App URL Open listener for deep linking (online.webguruji.ai:// or guruai://)
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

const isCRLF = content.includes('\r\n');
const normalizedContent = content.replace(/\r\n/g, '\n');

if (normalizedContent.includes(targetStr)) {
  let updated = normalizedContent.replace(targetStr, replacementStr);
  if (isCRLF) {
    updated = updated.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync('index.html', updated, 'utf8');
  console.log('Successfully updated session listener in index.html');
} else {
  console.error('Target string not found!');
  process.exit(1);
}
