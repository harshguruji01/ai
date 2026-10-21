/**
 * Hostinger Mail API Integration
 * Mailbox: info@webguruji.online
 */

const HOSTINGER_MAIL_API_BASE = 'https://api.mail.hostinger.com/api/v1';
const HOSTINGER_API_TOKEN = process.env.HOSTINGER_API_TOKEN || 'afa0c378c26eae81c5d0fbb5848f69ae108dfe0043d020cbd90e73f8e0a44b21';
const HOSTINGER_MAILBOX_ID = process.env.HOSTINGER_MAILBOX_ID || 'AC955bc6c100d79999a2c5613002ee';
const DEFAULT_SENDER = 'info@webguruji.online';

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
  displayName = 'HarshGuruJi Support',
  cc,
  bcc
}) {
  if (!to || !subject) {
    throw new Error('Both "to" and "subject" are required to send email.');
  }

  const toList = Array.isArray(to) ? to : [to];

  const payload = {
    to: toList,
    displayName,
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
