/**
 * HarshGuruJi Master Admin Security Bridge & Verification Controller
 * Enforces 1-Hour Session Security & Gate Pass Authorization across all admin consoles.
 * 
 * Gate Pass Credentials:
 * Email: harshguruji01@gmail.com
 * Code No.: 2547277654
 * Auto-Logout: 1 Hour (3,600,000 ms)
 */

(function () {
  'use strict';

  const HG_ADMIN_EMAIL = 'harshguruji01@gmail.com';
  const HG_ADMIN_ID = '2547277654';
  const AUTH_STATE_KEY = 'hg_2step_verified';
  const AUTH_TOKEN_KEY = 'hg_2step_token';
  const AUTH_TIME_KEY = 'hg_admin_login_time';
  const SESSION_MAX_MS = 60 * 60 * 1000; // 1 hour (3,600,000 ms)
  const EXPECTED_HASH = btoa(HG_ADMIN_EMAIL + ':' + HG_ADMIN_ID + ':HGJ_MASTER_ADMIN_2026');

  window.HG_ADMIN_EMAIL = HG_ADMIN_EMAIL;
  window.HG_EXPECTED_HASH = EXPECTED_HASH;
  window.HG_SESSION_MAX_MS = SESSION_MAX_MS;

  function setAllAdminSessions() {
    try {
      const now = Date.now().toString();
      sessionStorage.setItem(AUTH_STATE_KEY, 'true');
      sessionStorage.setItem(AUTH_TOKEN_KEY, EXPECTED_HASH);
      if (!sessionStorage.getItem(AUTH_TIME_KEY)) {
        sessionStorage.setItem(AUTH_TIME_KEY, now);
      }
      sessionStorage.setItem('hg_master_admin_authenticated', 'true');
      sessionStorage.setItem('admin_contacts_auth', 'true');
      sessionStorage.setItem('hg_contributor_admin_unlocked', 'true');
      sessionStorage.setItem('admin_apk_email', HG_ADMIN_EMAIL);
      sessionStorage.setItem('admin_chatbase_auth', 'true');
    } catch (e) {
      console.warn('Admin storage error:', e);
    }
  }

  function checkAdminAccess() {
    try {
      const isAuth = sessionStorage.getItem(AUTH_STATE_KEY) === 'true';
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      const email = sessionStorage.getItem('admin_apk_email');
      const loginTimeStr = sessionStorage.getItem(AUTH_TIME_KEY);

      if (!isAuth || !token || !email || !loginTimeStr) {
        return false;
      }

      const loginTime = parseInt(loginTimeStr, 10);
      const now = Date.now();
      if (isNaN(loginTime) || (now - loginTime) >= SESSION_MAX_MS) {
        clearAdminSessions();
        return false;
      }

      const validTokens = [
        EXPECTED_HASH,
        '7e78eb6fb8144145d73ddc52f80609f2a7150757b8f8c19c7afa1950b0e46b86',
        'e5b44bce70dbf185896bee1ccb5cae48eb8c2097c5219585032d1683eaae06aa'
      ];
      if (validTokens.includes(token) && (email.toLowerCase() === HG_ADMIN_EMAIL.toLowerCase() || email.toLowerCase() === 'harshguruji01@gmail.commit')) {
        return true;
      }
    } catch (e) {}

    return false;
  }

  function clearAdminSessions() {
    try {
      sessionStorage.clear();
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TIME_KEY);
      localStorage.removeItem('hg_master_admin_authenticated');
      localStorage.removeItem('admin_contacts_auth');
      localStorage.removeItem('hg_contributor_admin_unlocked');
      localStorage.removeItem('admin_chatbase_auth');
      localStorage.removeItem('admin_apk_email');
    } catch (e) {}
  }

  function setupAdminMasterLinks() {
    if (!checkAdminAccess()) return;
    setAllAdminSessions();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      if (checkAdminAccess()) {
        setupAdminMasterLinks();
      }
    });
  }

  window.setAllAdminSessions = setAllAdminSessions;
  window.setupAdminMasterLinks = setupAdminMasterLinks;
  window.checkAdminAccess = checkAdminAccess;
  window.clearAdminSessions = clearAdminSessions;
})();
