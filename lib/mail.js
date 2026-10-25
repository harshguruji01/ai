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
  const logoUrl = isAi ? 'https://webguruji.online/ai.png' : 'https://webguruji.online/logo.png';

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
          <div style="text-align: center; margin-bottom: 14px;">
            <img src="${logoUrl}" alt="${isAi ? 'GuruAI' : 'HarshGuruJi'}" width="68" height="68" style="width: 68px; height: 68px; border-radius: 18px; object-fit: contain; background: #070a13; padding: 4px; border: 2px solid rgba(255, 255, 255, 0.25); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); display: inline-block;" />
          </div>
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
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 8px;">
                        <img src="${logoUrl}" width="22" height="22" style="width: 22px; height: 22px; border-radius: 6px; display: block;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <span class="pass-title">✦ OFFICIAL MEMBER ACCESS PASS</span>
                      </td>
                    </tr>
                  </table>
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
  const logoUrl = isAi ? 'https://webguruji.online/ai.png' : 'https://webguruji.online/logo.png';
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
          <div style="text-align: center; margin-bottom: 12px;">
            <img src="${logoUrl}" alt="${isAi ? 'GuruAI' : 'HarshGuruJi'}" width="56" height="56" style="width: 56px; height: 56px; border-radius: 14px; object-fit: contain; background: #070a13; padding: 4px; border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); display: inline-block;" />
          </div>
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

/**
 * Generate AI Premium Upgrade Payment Details Email with QR Code & UPI Placeholder
 */
export function generateAiUpgradeInvoiceEmailHtml({ name = 'Member', email = '', planName = 'Starter Pro', planPrice = 5, contextLimit = 50000 }) {
  const safeName = String(name || 'Member').trim();
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GuruAI Premium Upgrade Details</title>
  <style>
    body { margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #0d121f; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); }
    .header { padding: 32px 30px; text-align: center; background: radial-gradient(circle at top center, rgba(99, 102, 241, 0.25), transparent 70%), #0d121f; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .logo { width: 56px; height: 56px; border-radius: 14px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 6px; }
    .content { padding: 30px; }
    .greeting { font-size: 16px; font-weight: 600; color: #e2e8f0; margin-bottom: 12px; }
    .lead { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .plan-box { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
    .plan-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; }
    .payment-card { background: #111827; border: 2px dashed #6366f1; border-radius: 16px; padding: 24px 20px; text-align: center; margin: 24px 0; }
    .qr-box { display: inline-block; background: #ffffff; padding: 14px; border-radius: 14px; margin: 12px auto; }
    .qr-placeholder { width: 180px; height: 180px; border: 2px dashed #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #4338ca; font-size: 12px; font-weight: 700; text-align: center; line-height: 1.4; padding: 10px; box-sizing: border-box; }
    .upi-box { background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 12px; margin: 14px auto; max-width: 360px; }
    .footer { padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; background-color: #07090e; border-top: 1px solid rgba(255, 255, 255, 0.06); }
    .footer a { color: #818cf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://webguruji.online/logo.png" alt="HarshGuruJi Logo" class="logo" />
      <h1 class="title">GuruAI Premium Upgrade Request</h1>
      <div class="subtitle">Official Invoice &amp; Payment Instructions ✦ HarshGuruJi Ecosystem</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${safeName},</div>
      <p class="lead">
        We have received your upgrade request for <strong>GuruAI (${planName})</strong>. Complete your payment below to unlock higher daily quotas, expanded multi-turn context memory, and advanced reasoning models.
      </p>

      <div class="plan-box">
        <div style="font-size: 11px; text-transform: uppercase; color: #a5b4fc; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.05em;">Plan Specification</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="color: #94a3b8;">Requested Plan:</td>
            <td style="text-align: right; font-weight: 700; color: #ffffff;">${planName}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Monthly Subscription:</td>
            <td style="text-align: right; font-weight: 700; color: #34d399; font-family: monospace;">$${planPrice} / month</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Context Memory Window:</td>
            <td style="text-align: right; font-weight: 700; color: #38bdf8; font-family: monospace;">${Number(contextLimit).toLocaleString()} Tokens</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Account Email:</td>
            <td style="text-align: right; font-mono; color: #e2e8f0;">${email}</td>
          </tr>
        </table>
      </div>

      <div class="payment-card">
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 6px;">
          ⚡ Payment Details
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">Scan QR Code or Pay via UPI</div>
        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 14px 0;">
          Please send payment for <strong>$${planPrice} (or equivalent in INR)</strong> using either method below:
        </p>

        <!-- UPI ID Container -->
        <div class="upi-box">
          <span style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Official UPI ID:</span>
          <span style="font-size: 15px; font-weight: 700; color: #38bdf8; font-family: monospace; letter-spacing: 0.05em;">
            [UPI ID: To be updated by HarshGuruJi]
          </span>
        </div>

        <!-- QR Code Placeholder Container -->
        <div class="qr-box">
          <div class="qr-placeholder">
            [QR CODE PLACEHOLDER<br><br>Payment QR will appear here]
          </div>
        </div>

        <p style="color: #cbd5e1; font-size: 12px; line-height: 1.5; margin: 12px 0 0 0;">
          After completing payment, HarshGuruJi will verify your transaction and instantly activate your upgraded limits in the Admin Panel.
        </p>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
        Need assistance or want instant confirmation? Reply directly to this email at <a href="mailto:info@webguruji.online" style="color: #818cf8;">info@webguruji.online</a> or contact us via <a href="https://webguruji.online/contact.html" style="color: #818cf8;">webguruji.online/contact.html</a>.
      </p>
    </div>

    <div class="footer">
      <div>GuruAI by HarshGuruJi ✦ <a href="https://ai.webguruji.online">ai.webguruji.online</a></div>
      <div style="margin-top: 6px;">Official Mail: <a href="mailto:info@webguruji.online">info@webguruji.online</a> • &copy; ${currentYear} Harsh Patel. All Rights Reserved.</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch AI Upgrade Invoice Email with QR/UPI placeholders
 */
export async function sendAiUpgradeInvoiceEmail({ to, name = 'Member', planName = 'Starter Pro', planPrice = 5, contextLimit = 50000 }) {
  if (!to) throw new Error('Recipient email "to" is required.');
  const html = generateAiUpgradeInvoiceEmailHtml({ name, email: to, planName, planPrice, contextLimit });
  const text = `GuruAI Premium Upgrade Request\n\nPlan: ${planName} ($${planPrice})\nContext Limit: ${contextLimit} Tokens\nAccount: ${to}\n\nPayment Details:\nUPI ID: [Placeholder for UPI ID]\nQR Code: [Placeholder for Payment QR]\n\nReply with your payment confirmation to info@webguruji.online for instant activation.`;

  return await sendHostingerEmail({
    to,
    subject: `GuruAI Premium Upgrade (${planName}) - Payment Instructions`,
    text,
    html,
    displayName: 'GuruAI Premium Upgrades'
  });
}

/**
 * Dispatch AI Upgrade Plan Approved Confirmation Email
 */
export async function sendAiUpgradeApprovedEmail({ to, name = 'Member', planName = 'Starter Pro', chatLimit = 100, contextLimit = 50000 }) {
  if (!to) throw new Error('Recipient email "to" is required.');
  const safeName = String(name || 'Member').trim();
  const currentYear = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your GuruAI Plan is Active!</title>
  <style>
    body { margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #0d121f; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; overflow: hidden; }
    .header { padding: 32px 30px; text-align: center; background: radial-gradient(circle at top center, rgba(16, 185, 129, 0.2), transparent 70%), #0d121f; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .content { padding: 30px; }
    .footer { padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; background-color: #07090e; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 style="color: #34d399; font-size: 22px; margin: 0;">🎉 GuruAI Plan Activated!</h1>
      <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Your ${planName} subscription is now live.</div>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #e2e8f0; margin-bottom: 16px;">Hi ${safeName},</p>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Your payment has been verified and your <strong>${planName}</strong> plan has been activated by HarshGuruJi!
      </p>
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 13px; color: #a7f3d0; margin-bottom: 6px;">✔ Daily Chat Allowance: <strong>${chatLimit} chats</strong></div>
        <div style="font-size: 13px; color: #a7f3d0; margin-bottom: 6px;">✔ Context Window Limit: <strong>${Number(contextLimit).toLocaleString()} Tokens</strong></div>
        <div style="font-size: 13px; color: #a7f3d0;">✔ Advanced Models: <strong>Unlocked &amp; Active</strong></div>
      </div>
      <p style="text-align: center; margin: 24px 0;">
        <a href="https://ai.webguruji.online/" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 28px; border-radius: 12px; font-size: 14px;">Open GuruAI Now ↗</a>
      </p>
    </div>
    <div class="footer">
      GuruAI by HarshGuruJi ✦ &copy; ${currentYear} All Rights Reserved.
    </div>
  </div>
</body>
</html>`;

  return await sendHostingerEmail({
    to,
    subject: `🎉 Activated: Your GuruAI ${planName} Plan is Live!`,
    html,
    displayName: 'GuruAI by HarshGuruJi'
  });
}

