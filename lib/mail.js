import dns from 'node:dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const HOSTINGER_MAIL_API_BASE = 'https://api.mail.hostinger.com/api/v1';
const HOSTINGER_API_TOKEN = process.env.HOSTINGER_API_TOKEN || 'afa0c378c26eae81c5d0fbb5848f69ae108dfe0043d020cbd90e73f8e0a44b21';
const HOSTINGER_MAILBOX_ID = process.env.HOSTINGER_MAILBOX_ID || 'AC955bc6c100d79999a2c5613002ee';
const DEFAULT_SENDER = 'info@webguruji.online';

/**
 * Generate a responsive, modern HTML welcome email
 * Supports source: 'ai' (GuruAI) or 'main' (HarshGuruJi Main Platform)
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} [params.source='main'] - 'ai' | 'main'
 */
export function generateWelcomeEmailHtml({ name = 'Friend', email = '', source = 'main' }) {
  const safeName = String(name || 'Friend').trim();
  const currentYear = new Date().getFullYear();
  const isAi = source === 'ai';

  const badgeText = isAi ? 'HarshGuruJi ✦ GuruAI' : 'HarshGuruJi ✦ Official Hub';
  const headingText = isAi ? 'Welcome to GuruAI Studio! 🤖' : 'Welcome to the Family! 🎉';
  const leadText = isAi
    ? `Aapka account GuruAI Studio par successfully connect ho gaya hai. Ab aap hamare cutting-edge AI chat model, daily free quotas, aur SDXL high-definition image generation ka bina kisi rukawat labh utha sakte hain.`
    : `Aapka account HarshGuruJi Platform par successfully create ho gaya hai. Ab aap hamare all-in-one AI ecosystem, student learning hub aur digital tools ka bina kisi rukawat labh utha sakte hain.`;

  const cardsHtml = isAi
    ? `
      <div class="feature-card">
        <div class="feature-title">💬 Guru-Flash 1.1 AI Conversations</div>
        <p class="feature-desc">10 Daily high-speed conversation requests with full context awareness, coding assistance, and research support.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">🎨 SDXL High-Definition Image Studio</div>
        <p class="feature-desc">5 free photorealistic SDXL image creations everyday directly through simple natural language prompts.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">⚡ Multi-turn History & Auto-sync</div>
        <p class="feature-desc">Access persistent conversation history across your devices with dark-mode optimized interface.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">🌐 HarshGuruJi All-in-One Ecosystem</div>
        <p class="feature-desc">One single account connects you to NCERT study books, developer tools, and our software store.</p>
      </div>
    `
    : `
      <div class="feature-card">
        <div class="feature-title">🤖 GuruAI Chat & Creative Studio</div>
        <p class="feature-desc">10 Daily AI conversation requests + 5 SDXL high-definition image generations everyday completely free.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">📚 NCERT Free Books & Notes</div>
        <p class="feature-desc">Classes 6th to 12th complete CBSE / State board textbooks, solutions and chapter PDFs directly accessible.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">⚡ Developer & SEO Tools Hub</div>
        <p class="feature-desc">Format code, test regex patterns, generate secure meta tags, and optimize your web performance.</p>
      </div>
      <div class="feature-card">
        <div class="feature-title">🛍️ HarshGuruJi Digital Store</div>
        <p class="feature-desc">Download verified software utilities, web source codes, templates, and student learning packages.</p>
      </div>
    `;

  const ctaBtnUrl = isAi ? 'https://ai.webguruji.online' : 'https://webguruji.online';
  const ctaBtnText = isAi ? 'Launch GuruAI Studio →' : 'Explore HarshGuruJi Hub →';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isAi ? 'Welcome to GuruAI' : 'Welcome to HarshGuruJi'}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0b0f19; padding-bottom: 40px; }
    .main { background-color: #111827; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; border: 1px solid #1f293d; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${isAi ? '#6366f1 0%, #06b6d4 100%' : '#4f46e5 0%, #06b6d4 100%'}); padding: 36px 24px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #0b0f19; padding: 10px 18px; border-radius: 9999px; font-weight: 800; font-size: 16px; color: #ffffff; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.2); }
    .content { padding: 32px 28px; }
    .greeting { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .lead { font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
    .feature-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .feature-title { font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; }
    .feature-desc { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin: 0; }
    .btn-container { text-align: center; margin: 32px 0 20px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35); }
    .divider { height: 1px; background-color: #1f293d; margin: 28px 0; }
    .footer { text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; padding: 0 20px; }
    .footer a { color: #818cf8; text-decoration: none; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <div class="logo-badge">${badgeText}</div>
          <h1 style="color: #ffffff; font-size: 24px; margin: 16px 0 0 0; font-weight: 800; letter-spacing: -0.5px;">${headingText}</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="greeting">Namaste, ${safeName}! 👋</div>
          <p class="lead">${leadText}</p>
          ${cardsHtml}
          <div class="btn-container">
            <a href="${ctaBtnUrl}" class="btn" target="_blank">${ctaBtnText}</a>
          </div>
          <div class="divider"></div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0 0 8px 0;">
            Registered Email: <strong style="color: #f1f5f9;">${email || 'Registered User'}</strong>
          </p>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Sent from official mailbox: <strong>info@webguruji.online</strong><br/>
            Agar aapko koi bhi madad chahiye, aap direct is email ka reply de sakte hain.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <div class="footer">
            <p style="margin: 0 0 6px 0;">© ${currentYear} HarshGuruJi (webguruji.online). All rights reserved.</p>
            <p style="margin: 0;">
              <a href="https://webguruji.online">Official Website</a> • 
              <a href="https://ai.webguruji.online">GuruAI Hub</a> • 
              <a href="https://webguruji.online/privacy-policy.html">Privacy Policy</a>
            </p>
          </div>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * Generate a responsive, high-security HTML email for Login Verification Code (OTP)
 * @param {Object} params
 * @param {string} params.code - 6-digit numeric verification code
 * @param {string} [params.email]
 * @param {number} [params.expiresMinutes=10]
 * @param {string} [params.source='main']
 */
export function generateVerificationCodeHtml({ code, email = '', expiresMinutes = 10, source = 'main' }) {
  const currentYear = new Date().getFullYear();
  const isAi = source === 'ai';
  const badgeText = isAi ? 'GuruAI ✦ Security Verification' : 'HarshGuruJi ✦ Security Verification';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Login Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    table { border-spacing: 0; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0b0f19; padding: 30px 10px 40px; }
    .main { background-color: #111827; margin: 0 auto; width: 100%; max-width: 540px; border-radius: 16px; border: 1px solid #1f293d; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1f293d; }
    .logo-badge { display: inline-block; background-color: #0b0f19; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; color: #38bdf8; border: 1px solid #334155; }
    .content { padding: 32px 28px; }
    .code-box { background: #030712; border: 2px dashed #6366f1; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-digits { font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; text-shadow: 0 0 15px rgba(56, 189, 248, 0.4); margin: 0; }
    .warning-box { background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 14px; margin-top: 24px; font-size: 13px; color: #fcd34d; line-height: 1.5; }
    .footer { text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; padding: 0 20px 24px; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <div class="logo-badge">${badgeText}</div>
          <h1 style="color: #ffffff; font-size: 22px; margin: 14px 0 0 0; font-weight: 800;">Login Verification Code</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6; margin: 0 0 16px 0;">
            Aapke HarshGuruJi account me login karne ke liye yeh one-time verification code use karein:
          </p>
          <div class="code-box">
            <div class="otp-digits">${code}</div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            Yeh code agle <strong>${expiresMinutes} minute</strong> tak valid hai.
          </p>
          <div class="warning-box">
            ⚠️ <strong>Security Notice:</strong> Yeh code kisi ke sath bhi share na karein. HarshGuruJi team kabhi bhi aapka verification code ya password nahi maangti.
          </div>
          ${email ? `<p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">Sent to: ${email}</p>` : ''}
        </td>
      </tr>
      <tr>
        <td>
          <div class="footer">
            <p style="margin: 0 0 6px 0;">Official Mailbox: <strong>info@webguruji.online</strong></p>
            <p style="margin: 0;">© ${currentYear} HarshGuruJi (webguruji.online). All rights reserved.</p>
          </div>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * Send an email using Hostinger's official Mail REST API
 * @param {Object} options
 * @param {string|string[]} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.displayName]
 * @param {string[]} [options.cc]
 * @param {string[]} [options.bcc]
 */
export async function sendHostingerEmail({
  to,
  subject,
  text,
  html,
  displayName = 'HarshGuruJi <info@webguruji.online>',
  cc,
  bcc
}) {
  if (!to || !subject) {
    throw new Error('Both "to" and "subject" are required to send email.');
  }

  const toList = Array.isArray(to) ? to : [to];

  const cleanDisplayName = String(displayName || 'HarshGuruJi Support')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim() || 'HarshGuruJi Support';

  const payload = {
    to: toList,
    displayName: cleanDisplayName,
    subject,
    text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
    html: html || (text ? `<p>${text.replace(/\n/g, '<br/>')}</p>` : '')
  };

  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];

  const url = `${HOSTINGER_MAIL_API_BASE}/mailboxes/${HOSTINGER_MAILBOX_ID}/send`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HOSTINGER_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.status === 204 || res.ok) {
    return {
      success: true,
      sender: DEFAULT_SENDER,
      recipients: toList,
      subject
    };
  }

  const errorText = await res.text();
  throw new Error(`Hostinger Mail API error (${res.status} ${res.statusText}): ${errorText}`);
}

/**
 * High-level helper to send Welcome Email to a newly registered user
 * Supports source: 'ai' or 'main'
 * @param {Object} params
 * @param {string} params.to - User's email address
 * @param {string} [params.name] - User's name
 * @param {string} [params.source='main'] - 'ai' or 'main'
 */
export async function sendWelcomeEmail({ to, name = 'Friend', source = 'main' }) {
  if (!to) throw new Error('Recipient email "to" is required.');
  
  const isAi = source === 'ai';
  const subject = isAi
    ? `Welcome to GuruAI by HarshGuruJi! 🎉 Welcome to AI Chat & Creative Studio`
    : `Welcome to HarshGuruJi! 🎉 Welcome to the Official Learning & Tech Hub`;

  const displayName = isAi
    ? 'GuruAI by HarshGuruJi'
    : 'HarshGuruJi';

  const html = generateWelcomeEmailHtml({ name, email: to, source });
  const text = isAi
    ? `Namaste ${name}!\n\nWelcome to GuruAI by HarshGuruJi! Aapka account successfully create ho gaya hai.\n\nAap GuruAI Chat Studio me 10 daily conversation requests aur 5 SDXL image creations enjoy kar sakte hain.\n\nVisit: https://ai.webguruji.online\nOfficial Site: https://webguruji.online\nSupport: info@webguruji.online`
    : `Namaste ${name}!\n\nWelcome to HarshGuruJi! Aapka account successfully create ho gaya hai.\n\nAap hamare all-in-one learning hub, developer tools, NCERT books aur GuruAI Chatbot ka bina kisi rukawat labh utha sakte hain.\n\nVisit: https://webguruji.online\nGuruAI: https://ai.webguruji.online\nSupport: info@webguruji.online`;

  return await sendHostingerEmail({
    to,
    subject,
    text,
    html,
    displayName
  });
}

/**
 * Send 6-digit login verification code (OTP) via Hostinger Mail API
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.code - 6-digit numeric verification code
 * @param {number} [params.expiresMinutes=10]
 * @param {string} [params.source='main']
 */
export async function sendVerificationCodeEmail({ to, code, expiresMinutes = 10, source = 'main' }) {
  if (!to || !code) throw new Error('Recipient email "to" and "code" are required.');

  const isAi = source === 'ai';
  const subject = `Your Login Verification Code: ${code} - HarshGuruJi`;
  const displayName = isAi
    ? 'GuruAI Security'
    : 'HarshGuruJi Security';

  const html = generateVerificationCodeHtml({ code, email: to, expiresMinutes, source });
  const text = `HarshGuruJi Security Verification\n\nAapka login verification code hai: ${code}\n\nYeh code agle ${expiresMinutes} minute tak valid hai.\n\nSecurity Notice: Is code ko kisi ke sath share na karein.\n\nMailbox: info@webguruji.online`;

  return await sendHostingerEmail({
    to,
    subject,
    text,
    html,
    displayName
  });
}
