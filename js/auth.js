import { supabase } from './supabase.js';
import { getProfile, updateProfile } from './profile.js';
import { trackActivity } from './activity-tracker.js';
import { sendWelcomeEmail } from './welcome-mailer.js';

// Immediate cross-subdomain redirect protection (e.g. from ai.webguruji.online)
(function checkCrossSubdomainBounce() {
  try {
    if (typeof window === 'undefined' || !window.location) return;
    const cookieMatch = document.cookie.match(/(?:^|;\s*)hg_auth_redirect=([^;]+)/);
    const pendingRedirect = cookieMatch ? decodeURIComponent(cookieMatch[1]) : (sessionStorage.getItem('hg_auth_redirect') || '');
    const urlParams = new URLSearchParams(window.location.search);
    const isAiSource = urlParams.get('source') === 'ai' || (pendingRedirect && pendingRedirect.includes('ai.webguruji.online'));
    const hasAuthToken = window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token='));

    if (isAiSource && (hasAuthToken || (pendingRedirect && pendingRedirect.includes('ai.webguruji.online')))) {
      const target = (pendingRedirect && pendingRedirect.includes('ai.webguruji.online')) ? pendingRedirect : 'https://ai.webguruji.online/';
      const hostname = window.location.hostname;
      const domainStr = (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) ? '; domain=.webguruji.online' : '';
      document.cookie = `hg_auth_redirect=; path=/; max-age=0${domainStr}; SameSite=Lax`;
      try { sessionStorage.removeItem('hg_auth_redirect'); } catch(e){}
      
      const cleanTarget = target.split('#')[0];
      const targetHash = window.location.hash || '';
      window.location.replace(cleanTarget + (cleanTarget.includes('?') ? '&' : '?') + 'login_success=1' + targetHash);
    }
  } catch(e) {}
})();

/**
 * Display non-intrusive auth greeting toast
 */
function displayAuthToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type, 4500);
    return;
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#111827;color:#f8fafc;padding:14px 20px;border-radius:12px;border:1px solid #6366f1;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;gap:10px;';
  toast.innerHTML = (type === 'success' ? '<span>🎉</span>' : '<span>👋</span>') + `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/**
 * Check and display any pending greeting from login/signup
 */
export function checkAndDisplayPendingGreeting() {
  try {
    const raw = sessionStorage.getItem('hg_pending_greeting');
    if (!raw) return;
    sessionStorage.removeItem('hg_pending_greeting');
    const { type, name, email } = JSON.parse(raw);
    if (type === 'new') {
      displayAuthToast(`Welcome to HarshGuruJi, ${name}! 🎉 Welcome email sent to ${email || 'your email'}.`, 'success');
    } else {
      displayAuthToast(`Welcome back, ${name}! 👋`, 'info');
    }
  } catch (e) {
    console.warn('Greeting check notice:', e);
  }
}

// Automatically check on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndDisplayPendingGreeting, { once: true });
} else {
  setTimeout(checkAndDisplayPendingGreeting, 100);
}

// Expose AuthManager globally for convenience or use via exports
export const AuthManager = {
  supabase,
  currentUser: null,
  currentProfile: null,

  async init() {
    try {
      // Check initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        await this.handleUserLogin(session.user);
      } else {
        this.handleUserLogout();
      }
    } catch (err) {
      console.warn("Session check notice:", err);
      this.handleUserLogout();
    }

    // Listen to Supabase Auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event);
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && session.user) {
        await this.handleUserLogin(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleUserLogout();
      }
    });
  },

  async handleUserLogin(user) {
    this.currentUser = user;
    
    // Ensure both user.id and user.uid are available for backward compatibility
    user.uid = user.id;

    // Check if profile exists, if not, create one
    let isNewUser = false;
    let profile = await getProfile(user.id);
    if (!profile) {
      isNewUser = true;
      console.log("No profile found in Supabase, creating from metadata...");
      const userMetadata = user.user_metadata || {};
      const newProfile = {
        id: user.id,
        display_name: userMetadata.full_name || userMetadata.name || (user.email ? user.email.split('@')[0] : 'User'),
        avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
        email: user.email,
        golden_tick: false,
        updated_at: new Date().toISOString(),
      };
      profile = await updateProfile(user.id, newProfile);
      
      // Log account created event
      await trackActivity({
        activity_type: 'account_created',
        page_type: 'system',
        page_name: 'Account Setup',
        metadata: { provider: user.app_metadata?.provider || 'supabase' }
      });
    }

    const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'User');
    const userEmail = (user.email || '').toLowerCase();

    // Determine if welcome email should be sent or if welcome back greeting should be displayed
    const justSignedUp = sessionStorage.getItem('hg_just_signed_up') === userEmail;
    const welcomeAlreadySent = user.user_metadata?.welcome_email_sent === true || localStorage.getItem('hg_welcome_sent_' + user.id) === 'true';

    if ((isNewUser || justSignedUp) && !welcomeAlreadySent) {
      // 1. NEW USER: Send Welcome Email from info@webguruji.online via Hostinger Mail API
      console.log('🎉 New user detected. Triggering welcome email to', userEmail);
      try {
        sessionStorage.removeItem('hg_just_signed_up');
        localStorage.setItem('hg_welcome_sent_' + user.id, 'true');
        await supabase.auth.updateUser({
          data: { welcome_email_sent: true, welcome_sent_at: new Date().toISOString() }
        });
        sendWelcomeEmail({ to: userEmail, name: displayName, source: 'main' });
      } catch (mailErr) {
        console.warn('Welcome mail dispatch notice:', mailErr);
      }

      // Schedule greeting for new user
      const greetingSessionKey = 'hg_greeting_shown_' + user.id;
      if (!sessionStorage.getItem(greetingSessionKey)) {
        sessionStorage.setItem(greetingSessionKey, 'true');
        sessionStorage.setItem('hg_pending_greeting', JSON.stringify({
          type: 'new',
          name: displayName,
          email: userEmail
        }));
        checkAndDisplayPendingGreeting();
      }
    } else {
      // 2. RETURNING USER: DO NOT SEND EMAIL! Show "Welcome back" greeting
      const greetingSessionKey = 'hg_greeting_shown_' + user.id;
      if (!sessionStorage.getItem(greetingSessionKey)) {
        sessionStorage.setItem(greetingSessionKey, 'true');
        sessionStorage.setItem('hg_pending_greeting', JSON.stringify({
          type: 'returning',
          name: displayName
        }));
        checkAndDisplayPendingGreeting();
      }
    }

    // Track standard page view
    await trackActivity({ activity_type: 'page_view' });


    // Verify contributor and golden_tick integrity
    const isOwner = userEmail === 'harshguruji01@gmail.com';
    let isContributor = isOwner;

    try {
      // Check if user has an active, verified contributor record
      const { data: contributorData } = await supabase
        .from('contributors')
        .select('id, status, verified')
        .eq('user_id', user.id)
        .in('status', ['ACTIVE', 'approved'])
        .maybeSingle();

      if (contributorData && (contributorData.verified === true || contributorData.status === 'ACTIVE')) {
        isContributor = true;
      }

      // Safety: If profile has golden_tick = true but user is NOT the owner and NOT an active approved contributor, revoke golden_tick immediately!
      if (profile && profile.golden_tick === true && !isContributor) {
        profile.golden_tick = false;
        await supabase
          .from('profiles')
          .update({ golden_tick: false })
          .eq('id', user.id);
      }

      // Conversely, if user IS owner or verified contributor, ensure golden_tick is true
      if (profile && profile.golden_tick !== true && isContributor) {
        profile.golden_tick = true;
        await supabase
          .from('profiles')
          .update({ golden_tick: true })
          .eq('id', user.id);
      }

      // Hide contributor CTA buttons if already a verified contributor or owner
      if (isContributor) {
        const indexCta = document.getElementById('contributor-cta');
        if (indexCta) indexCta.style.display = 'none';
        const pageCta = document.getElementById('become-cta');
        if (pageCta) pageCta.style.display = 'none';
      }
    } catch(err) {
      console.warn("Contributor status check notice:", err);
    }

    this.currentProfile = profile;

    // Dispatch global event for UI updates (navbar, dashboard, settings, contributor)
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { user: this.currentUser, profile: this.currentProfile } 
    }));

    // If login was initiated from AI Hub, return user to AI Hub immediately
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)hg_auth_redirect=([^;]+)/);
      const pendingRedirect = cookieMatch ? decodeURIComponent(cookieMatch[1]) : (sessionStorage.getItem('hg_auth_redirect') || '');
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('source') === 'ai' || (pendingRedirect && pendingRedirect.includes('ai.webguruji.online'))) {
        const target = (pendingRedirect && pendingRedirect.includes('ai.webguruji.online')) ? pendingRedirect : 'https://ai.webguruji.online/';
        const hostname = window.location.hostname;
        const domainStr = (hostname === 'webguruji.online' || hostname.endsWith('.webguruji.online')) ? '; domain=.webguruji.online' : '';
        document.cookie = `hg_auth_redirect=; path=/; max-age=0${domainStr}; SameSite=Lax`;
        try { sessionStorage.removeItem('hg_auth_redirect'); } catch(e){}
        setTimeout(() => { window.location.replace(target); }, 150);
        return;
      }
    } catch(e) {}
  },

  handleUserLogout() {
    this.currentUser = null;
    this.currentProfile = null;
    const indexCta = document.getElementById('contributor-cta');
    if (indexCta) indexCta.style.display = '';
    const pageCta = document.getElementById('become-cta');
    if (pageCta) pageCta.style.display = '';
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { user: null, profile: null } 
    }));
  }
};

/**
 * Sign In with Supabase Email & Password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("Supabase sign in error:", error);
    let msg = error.message;
    if (msg.includes('Invalid login credentials')) {
      msg = "Invalid email or password. Please check your credentials.";
    } else if (msg.includes('Email not confirmed')) {
      msg = "Please verify your email before signing in.";
    }
    throw new Error(msg);
  }
  return data;
}

/**
 * Sign Up with Supabase Email & Password
 */
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: name,
        name: name
      }
    }
  });
  if (error) {
    console.error("Supabase sign up error:", error);
    throw error;
  }
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error("This email is already registered. Please sign in instead.");
  }
  return data;
}

/**
 * Sign In with Supabase Google OAuth
 */
export async function signInWithGoogle() {
  let returnTarget = window.location.origin + '/dashboard.html';
  try {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('redirect') || sessionStorage.getItem('hg_auth_redirect');
    if (p && !p.includes('login.html')) {
      returnTarget = p.startsWith('http') ? p : (window.location.origin + '/' + p);
    }
  } catch(e) {}
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: returnTarget
    }
  });
  if (error) {
    console.error("Supabase Google sign in error:", error);
    throw error;
  }
  if (data && data.url) {
    window.location.href = data.url;
  }
  return data;
}

/**
 * Sign Out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase sign out error:", error);
    throw error;
  }
  window.location.href = 'index.html';
}

/**
 * Get Current Session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

/**
 * Phone OTP Auth (Optional)
 */
export async function signInWithPhone(phone) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
  return data;
}

export async function verifyPhoneOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data;
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password.html'
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

/**
 * Send 6-digit login verification code to user's email via info@webguruji.online
 * @param {string} email
 * @param {string} password
 * @param {string} [source='main']
 */
export async function sendLoginVerificationCode(email, password, source = 'main') {
  const res = await fetch('https://ai.webguruji.online/api/auth/send-login-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, source })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send login verification code.');
  }
  return data;
}

/**
 * Verify 6-digit login verification code
 * @param {string} email
 * @param {string} code
 * @param {string} token
 * @param {string} [source='main']
 */
export async function verifyLoginCode(email, code, token, source = 'main') {
  const res = await fetch('https://ai.webguruji.online/api/auth/verify-login-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, token, source })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify login code.');
  }
  return data;
}

// Automatically start AuthManager listener and expose on window
window.AuthManager = AuthManager;
AuthManager.init();