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

  const badgeText = isAi ? 'GuruAI ✦ HarshGuruJi Studio' : 'HarshGuruJi ✦ Official Ecosystem';
  const headingText = isAi ? 'Welcome to GuruAI Studio! 🤖' : 'Welcome to HarshGuruJi! 🎉';
  const taglineText = isAi
    ? 'Your Personal AI Creative & Intelligence Workspace is Activated'
    : 'Your All-in-One Digital Hub for Learning, Developer Tools & AI is Ready';

  const leadText = isAi
    ? `Aapka account <strong>GuruAI Studio</strong> par successfully activate ho gaya hai! Ab aap high-speed conversational AI, contextual coding answers, aur SDXL Ultra-HD image generation ka bina kisi rukawat anand le sakte hain.`
    : `Aapka account <strong>HarshGuruJi Official Platform</strong> par successfully create ho gaya hai! Ab aap hamare all-in-one AI ecosystem, free NCERT digital textbooks, developer utilities aur software store ka bina kisi rukawat labh utha sakte hain.`;

  const cardsHtml = isAi
    ? `
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">💬</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">Guru-Flash 1.1 AI Conversations <span class="tag-badge">10 / Day</span></div>
              <p class="feature-desc">Lightning-fast contextual intelligence for programming, academic research, creative writing, and reasoning.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">🎨</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">SDXL Ultra-HD Image Studio <span class="tag-badge">5 / Day</span></div>
              <p class="feature-desc">Turn any imagination into photorealistic artwork, 3D renders, and cinematic visuals with natural language prompts.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">⚡</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">Multi-Turn Cloud History <span class="tag-badge">Auto Sync</span></div>
              <p class="feature-desc">Conversations auto-save and sync seamlessly across your smartphones, laptops, and tablets with zero data loss.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">🌐</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">Full Platform Integration <span class="tag-badge">Unified SSO</span></div>
              <p class="feature-desc">One single sign-in unlocks NCERT textbooks, developer utilities, and official downloads across the ecosystem.</p>
            </td>
          </tr>
        </table>
      </div>
    `
    : `
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">🤖</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">GuruAI Chat & Image Studio <span class="tag-badge">Included Free</span></div>
              <p class="feature-desc">10 Daily AI conversation requests + 5 photorealistic SDXL image creations everyday completely free.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">📚</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">Complete NCERT Digital Library <span class="tag-badge">Classes 6-12</span></div>
              <p class="feature-desc">Instant online reading and high-speed chapter PDF downloads for CBSE and State board students.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">⚡</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">Developer & Utility Tools Hub <span class="tag-badge">No Limits</span></div>
              <p class="feature-desc">Code formatters, regex tester, secure password generator, percentage calculators, and SEO meta generators.</p>
            </td>
          </tr>
        </table>
      </div>
      <div class="feature-card">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="44" valign="top">
              <div class="icon-circle">🛍️</div>
            </td>
            <td valign="top" style="padding-left: 12px;">
              <div class="feature-title">HarshGuruJi Software & Game Hub <span class="tag-badge">Verified</span></div>
              <p class="feature-desc">Verified software utilities, learning projects, source codes, and interactive online mini-games.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

  const ctaBtnUrl = isAi ? 'https://ai.webguruji.online' : 'https://webguruji.online';
  const ctaBtnText = isAi ? '🚀 Launch GuruAI Studio Now' : '✨ Explore HarshGuruJi Hub Now';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isAi ? 'Welcome to GuruAI by HarshGuruJi' : 'Welcome to HarshGuruJi'}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #070a13; padding: 30px 10px 50px 10px; }
    .main { background-color: #0f172a; margin: 0 auto; width: 100%; max-width: 620px; border-radius: 20px; border: 1px solid #1e293b; border-top: 4px solid #6366f1; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); }
    .header { background: linear-gradient(135deg, ${isAi ? '#4f46e5 0%, #7c3aed 50%, #06b6d4 100%' : '#3b82f6 0%, #6366f1 50%, #06b6d4 100%'}); padding: 40px 28px; text-align: center; }
    .logo-badge { display: inline-block; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); padding: 8px 20px; border-radius: 9999px; font-weight: 800; font-size: 13px; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    .content { padding: 36px 30px; }
    .greeting { font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
    .lead { font-size: 15px; line-height: 1.65; color: #cbd5e1; margin-bottom: 24px; }
    
    .pass-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 14px; padding: 18px 20px; margin: 24px 0 28px 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
    .pass-header { border-bottom: 1px solid #1f293d; padding-bottom: 12px; margin-bottom: 12px; }
    .pass-title { font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; }
    .pass-status { font-size: 11px; background: rgba(16,185,129,0.15); color: #34d399; padding: 4px 10px; border-radius: 999px; font-weight: 800; border: 1px solid rgba(52,211,153,0.3); }
    .pass-row { font-size: 13px; line-height: 1.7; }
    
    .section-title { font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin: 28px 0 16px 0; display: block; }
    .feature-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 16px; margin-bottom: 12px; transition: border-color 0.2s ease; }
    .icon-circle { width: 40px; height: 40px; border-radius: 10px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); text-align: center; line-height: 40px; font-size: 18px; }
    .feature-title { font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 4px; }
    .tag-badge { font-size: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(56, 189, 248, 0.25); vertical-align: middle; margin-left: 6px; }
    .feature-desc { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; }
    
    .steps-card { background: rgba(15, 23, 42, 0.6); border: 1px dashed #334155; border-radius: 12px; padding: 18px; margin: 24px 0; }
    .step-item { font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 8px; }
    .step-num { display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: #6366f1; color: #ffffff; text-align: center; line-height: 20px; font-size: 11px; font-weight: 700; margin-right: 8px; }

    .btn-container { text-align: center; margin: 34px 0 24px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.45); border: 1px solid rgba(255,255,255,0.25); }
    
    .support-box { background: rgba(30, 41, 59, 0.5); border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; text-align: center; margin: 28px 0 10px 0; }
    .support-title { font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
    .support-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; }
    
    .divider { height: 1px; background-color: #1f293d; margin: 28px 0; }
    .footer { text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; padding: 0 20px; }
    .footer a { color: #818cf8; text-decoration: none; margin: 0 6px; }
    .footer a:hover { color: #38bdf8; text-decoration: underline; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td class="header">
          <div class="logo-badge">${badgeText}</div>
          <h1 style="color: #ffffff; font-size: 26px; margin: 16px 0 6px 0; font-weight: 800; letter-spacing: -0.5px;">${headingText}</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0; font-weight: 500;">${taglineText}</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="greeting">Namaste, ${safeName}! 👋</div>
          <p class="lead">${leadText}</p>

          <!-- VIP Member Access Pass Card -->
          <div class="pass-card">
            <table width="100%" cellpadding="0" cellspacing="0" class="pass-header">
              <tr>
                <td align="left">
                  <span class="pass-title">✦ OFFICIAL MEMBER ACCESS PASS</span>
                </td>
                <td align="right">
                  <span class="pass-status">ACTIVE & VERIFIED ✓</span>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" class="pass-row">
              <tr>
                <td style="color: #94a3b8; padding: 4px 0;">Registered Email:</td>
                <td style="color: #f8fafc; font-weight: 700; text-align: right; padding: 4px 0;">${email || 'Registered User'}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 4px 0;">Membership Tier:</td>
                <td style="color: #38bdf8; font-weight: 700; text-align: right; padding: 4px 0;">Lifetime Free Access</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 4px 0;">Daily AI Quota:</td>
                <td style="color: #c084fc; font-weight: 700; text-align: right; padding: 4px 0;">10 Chats + 5 SDXL Images / Day</td>
              </tr>
            </table>
          </div>

          <span class="section-title">✨ What You Can Do Right Now</span>
          ${cardsHtml}

          <!-- Quick 3-Step Guide -->
          <div class="steps-card">
            <div style="font-weight: 700; color: #f8fafc; font-size: 13px; margin-bottom: 10px;">🚀 Quick Start Guide:</div>
            <div class="step-item"><span class="step-num">1</span> <strong>Open Portal:</strong> Click the button below to launch your workspace.</div>
            <div class="step-item"><span class="step-num">2</span> <strong>Ask or Create:</strong> Try prompting GuruAI or browse our free NCERT & Dev tools.</div>
            <div class="step-item" style="margin-bottom:0;"><span class="step-num">3</span> <strong>Auto Sync:</strong> Your history and bookmarks save automatically.</div>
          </div>

          <!-- Hero Action Button -->
          <div class="btn-container">
            <a href="${ctaBtnUrl}" class="btn" target="_blank">${ctaBtnText}</a>
          </div>

          <!-- Support & Trust Box -->
          <div class="support-box">
            <div class="support-title">🛡️ Official Communication & Direct Support</div>
            <p class="support-desc">
              Sent securely from <strong>info@webguruji.online</strong>.<br/>
              Agar aapko koi bhi sawal, feedback ya problem ho, aap <strong>bina kisi jhijhak is email ka direct reply de sakte hain</strong>.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 28px;">
          <div class="divider"></div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8;">
              © ${currentYear} HarshGuruJi (webguruji.online). All rights reserved.
            </p>
            <p style="margin: 0;">
              <a href="https://webguruji.online">Official Website</a> • 
              <a href="https://ai.webguruji.online">GuruAI Studio</a> • 
              <a href="https://webguruji.online/tools.html">Tools Hub</a> • 
              <a href="https://webguruji.online/books.html">NCERT Library</a> • 
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
