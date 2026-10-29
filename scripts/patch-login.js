import fs from 'node:fs';

let html = fs.readFileSync('login.html', 'utf8');
const isCrlf = html.includes('\r\n');
let normalized = html.replace(/\r\n/g, '\n');

// 1. Add apiBase definition before fetch calls if not present
if (!normalized.includes('const getApiBase = () =>')) {
  normalized = normalized.replace(
    'const SUPABASE_ANON_KEY =',
    `const getApiBase = () => (window.location.protocol === 'https:' && window.location.origin.includes('webguruji.online')) ? '' : 'https://ai.webguruji.online';\n    const SUPABASE_ANON_KEY =`
  );
}

// 2. Replace /api/auth/verify-login-code with \${getApiBase()}/api/auth/verify-login-code
normalized = normalized.replace(
  "fetch('/api/auth/verify-login-code'",
  "fetch(`${getApiBase()}/api/auth/verify-login-code`"
);

// 3. Replace /api/auth/send-login-code with \${getApiBase()}/api/auth/send-login-code
normalized = normalized.replace(
  "fetch('/api/auth/send-login-code'",
  "fetch(`${getApiBase()}/api/auth/send-login-code`"
);

// 4. Replace /api/mail/send with \${getApiBase()}/api/mail/send
normalized = normalized.replaceAll(
  "fetch('/api/mail/send'",
  "fetch(`${getApiBase()}/api/mail/send`"
);

if (isCrlf) {
  normalized = normalized.replace(/\n/g, '\r\n');
}

fs.writeFileSync('login.html', normalized, 'utf8');
console.log('login.html patched successfully!');
