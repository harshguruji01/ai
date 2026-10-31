(function() {
  window.SUPABASE_URL = 'https://wumdbpyhpblvgjttsbpv.supabase.co';
  window.SUPABASE_ANON_KEY = 'sb_publishable_xLqKY9N62MXb6ELG-5trig_RlJs_n-l';

  function getRawCookie(name) {
    if (typeof document === 'undefined') return null;
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length >= 2) {
      try {
        return decodeURIComponent(parts.pop().split(';').shift());
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  function getSharedCookie(name) {
    var main = getRawCookie(name);
    if (!main) return null;
    if (main.indexOf('chunked:') === 0) {
      var count = parseInt(main.split(':')[1], 10);
      var combined = '';
      for (var i = 0; i < count; i++) {
        var part = getRawCookie(name + '.' + i);
        if (part) {
          combined += part;
        }
      }
      return combined || null;
    }
    return main;
  }

  function setRawCookie(name, value, days) {
    if (typeof document === 'undefined') return;
    days = days || 365;
    var maxAge = days * 24 * 60 * 60;
    var hostname = window.location.hostname;
    var domainStr = '';
    if (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) {
      domainStr = '; domain=.webguruji.online';
    }
    var secureStr = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + domainStr + '; SameSite=Lax' + secureStr;
  }

  function removeRawCookie(name) {
    if (typeof document === 'undefined') return;
    var hostname = window.location.hostname;
    var domainStr = '';
    if (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) {
      domainStr = '; domain=.webguruji.online';
    }
    var secureStr = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = name + '=; path=/; max-age=0' + domainStr + '; SameSite=Lax' + secureStr;
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax' + secureStr;
  }

  function setSharedCookie(name, value, days) {
    if (!value) {
      removeSharedCookie(name);
      return;
    }
    var CHUNK_SIZE = 2500;
    var strVal = String(value);
    if (strVal.length > CHUNK_SIZE) {
      var chunks = [];
      for (var i = 0; i < strVal.length; i += CHUNK_SIZE) {
        chunks.push(strVal.substring(i, i + CHUNK_SIZE));
      }
      setRawCookie(name, 'chunked:' + chunks.length, days);
      for (var j = 0; j < chunks.length; j++) {
        setRawCookie(name + '.' + j, chunks[j], days);
      }
    } else {
      setRawCookie(name, strVal, days);
    }
  }

  function removeSharedCookie(name) {
    var main = getRawCookie(name);
    if (main && main.indexOf('chunked:') === 0) {
      var count = parseInt(main.split(':')[1], 10);
      for (var i = 0; i < count; i++) {
        removeRawCookie(name + '.' + i);
      }
    }
    removeRawCookie(name);
  }

  window.HG_SHARED_STORAGE = {
    getItem: function(key) {
      try {
        var local = localStorage.getItem(key);
        if (local) {
          setSharedCookie(key, local);
          return local;
        }
      } catch (e) {}

      var fromCookie = getSharedCookie(key);
      if (fromCookie) {
        try {
          localStorage.setItem(key, fromCookie);
        } catch (e) {}
        return fromCookie;
      }
      return null;
    },
    setItem: function(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
      setSharedCookie(key, value);
    },
    removeItem: function(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      removeSharedCookie(key);
    }
  };

  window.getSharedCookie = getSharedCookie;
  window.setSharedCookie = setSharedCookie;
  window.removeSharedCookie = removeSharedCookie;

  window.getCachedUserSession = function() {
    try {
      var raw = window.HG_SHARED_STORAGE ? window.HG_SHARED_STORAGE.getItem('sb-wumdbpyhpblvgjttsbpv-auth-token') : null;
      if (!raw && typeof localStorage !== 'undefined') {
        raw = localStorage.getItem('sb-wumdbpyhpblvgjttsbpv-auth-token');
      }
      if (!raw && typeof getSharedCookie === 'function') {
        raw = getSharedCookie('sb-wumdbpyhpblvgjttsbpv-auth-token');
      }
      if (!raw && typeof localStorage !== 'undefined') {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') !== -1) {
            raw = localStorage.getItem(k);
            break;
          }
        }
      }
      if (raw) {
        var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && parsed.user) return parsed.user;
        if (parsed && parsed.currentSession && parsed.currentSession.user) return parsed.currentSession.user;
      }
    } catch (e) {}
    return null;
  };

  try {
    var fastUser = window.getCachedUserSession();
    if (fastUser && fastUser.email) {
      window.__INITIAL_USER__ = fastUser;
      if (typeof document !== 'undefined' && document.head) {
        var style = document.createElement('style');
        style.id = 'hg-auth-fast-style';
        style.textContent = '#headerSignInBtn { display: none !important; } #headerDashboardBtn { display: flex !important; } #openAuthBtn { display: none !important; }';
        document.head.appendChild(style);
      }
    }
  } catch(e) {}

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: {
        storage: window.HG_SHARED_STORAGE,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    });
  }
})();
