import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  chatRequestSchema,
  imageGenerateSchema,
  userPreferencesSchema,
  conversationCreateSchema,
} from '../lib/validation.js';
import { buildSystemPrompt, isImageIntent, isCreatorIntent, isModelIntent } from '../lib/ai/nvidia.js';
import { generateGuestKeyHash, extractClientIp } from '../lib/security.js';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const siteRepoRoot = path.resolve(
  process.env.SITE_REPO_PATH || path.join(testsDir, '..', '..', 'site')
);
const storeRepoRoot = path.resolve(
  process.env.STORE_REPO_PATH || path.join(testsDir, '..', '..', 'store')
);

console.log('🚀 Running HarshGuruJi AI Automated Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failedTests++;
  }
}

// 1. Validation Schemas Tests
test('Validation: Rejects empty chat prompt', () => {
  const result = chatRequestSchema.safeParse({ prompt: '' });
  assert.strictEqual(result.success, false);
});

test('Validation: Accepts valid chat request with defaults', () => {
  const result = chatRequestSchema.safeParse({ prompt: 'Hello HarshGuruJi AI' });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.language, 'english');
  assert.strictEqual(result.data.isImageMode, false);
});

test('Validation: Accepts Hinglish and Hindi language tags', () => {
  const hinglishRes = chatRequestSchema.safeParse({ prompt: 'Test', language: 'hinglish' });
  assert.strictEqual(hinglishRes.success, true);
  const hindiRes = chatRequestSchema.safeParse({ prompt: 'Test', language: 'hindi' });
  assert.strictEqual(hindiRes.success, true);
  const invalidRes = chatRequestSchema.safeParse({ prompt: 'Test', language: 'spanish' });
  assert.strictEqual(invalidRes.success, false);
});

test('Validation: Rejects chat prompt exceeding 4000 characters', () => {
  const longPrompt = 'a'.repeat(4001);
  const result = chatRequestSchema.safeParse({ prompt: longPrompt });
  assert.strictEqual(result.success, false);
});

test('Validation: Image prompt validation', () => {
  assert.strictEqual(imageGenerateSchema.safeParse({ prompt: 'ab' }).success, false);
  assert.strictEqual(imageGenerateSchema.safeParse({ prompt: 'Sunset over Mumbai skyline' }).success, true);
});

test('Validation: User preferences theme & font size validation', () => {
  const validPref = {
    theme: 'cyberpunk',
    font_size: 'large',
    font_family: 'mono',
    ai_language: 'hinglish',
  };
  assert.strictEqual(userPreferencesSchema.safeParse(validPref).success, true);

  const invalidPref = {
    theme: 'neon-rainbow',
    font_size: 'huge',
    font_family: 'comic-sans',
    ai_language: 'korean',
  };
  assert.strictEqual(userPreferencesSchema.safeParse(invalidPref).success, false);
});

// 2. Image Intent Detection Tests
test('AI Intent: Accurately detects explicit image requests', () => {
  assert.strictEqual(isImageIntent('Generate image of an astronaut'), true);
  assert.strictEqual(isImageIntent('Create an image with glowing flowers'), true);
  assert.strictEqual(isImageIntent('draw a picture of Taj Mahal'), true);
  assert.strictEqual(isImageIntent('paint a picture of river'), true);
});

test('AI Intent: Does NOT falsely classify text/code queries containing the word image', () => {
  assert.strictEqual(isImageIntent('How do I optimize Docker image size in Node.js?'), false);
  assert.strictEqual(isImageIntent('Explain the HTML <img> tag with src attributes'), false);
  assert.strictEqual(isImageIntent('What is image processing in Python OpenCV?'), false);
});

test('AI Intent: Accurately detects creator and owner queries', () => {
  assert.strictEqual(isCreatorIntent('who created you?'), true);
  assert.strictEqual(isCreatorIntent('tumhe kisne banaya hai?'), true);
  assert.strictEqual(isCreatorIntent('who is your owner?'), true);
  assert.strictEqual(isCreatorIntent('who is harshguruji?'), true);
  assert.strictEqual(isCreatorIntent('owner kaun hai'), true);
  assert.strictEqual(isCreatorIntent('Write a quicksort in JavaScript'), false);
});

test('AI Intent: Accurately detects Guru-Flash 1.1 and model queries', () => {
  assert.strictEqual(isModelIntent('what is guru flash 1.1?'), true);
  assert.strictEqual(isModelIntent('guru flash 1.1 kya hai?'), true);
  assert.strictEqual(isModelIntent('ye kis model par chal raha hai?'), true);
  assert.strictEqual(isModelIntent('which model are you running on?'), true);
  assert.strictEqual(isModelIntent('tell me a joke about dogs'), false);
});

// 3. System Prompt Construction Tests
test('System Prompt: Hindi Devanagari instructions included', () => {
  const prompt = buildSystemPrompt('hindi');
  assert.ok(prompt.includes('Devanagari'));
  assert.ok(prompt.includes('GuruAI'));
  assert.ok(prompt.includes('HarshGuruJi'));
  assert.ok(prompt.includes('Guru-Flash 1.1'));
});

test('System Prompt: Hinglish conversational rules included', () => {
  const prompt = buildSystemPrompt('hinglish');
  assert.ok(prompt.includes('Hinglish'));
  assert.ok(prompt.includes('Latin/English script'));
  assert.ok(prompt.includes('Guru-Flash 1.1'));
});

test('System Prompt: English default rules included', () => {
  const prompt = buildSystemPrompt('english');
  assert.ok(prompt.includes('English'));
  assert.ok(prompt.includes('Guru-Flash 1.1'));
});

test('System Prompt: Permanent Creator Memory includes Owner, Domains & Biography Link', () => {
  const prompt = buildSystemPrompt('english');
  assert.ok(prompt.includes('HarshGuruJi'));
  assert.ok(prompt.includes('https://webguruji.online'));
  assert.ok(prompt.includes('https://ai.webguruji.online'));
  assert.ok(prompt.includes('https://webguruji.online/owner.html'));
  assert.ok(prompt.includes('FORBIDDEN URL RULES'));
  assert.ok(prompt.includes('everyday life'));
});

// 4. Guest Anti-Abuse Key Hash Tests
test('Security: HMAC Guest Key is deterministic and non-reversible', () => {
  const hash1 = generateGuestKeyHash('103.21.244.2', 'v_fp_12345', 'Mozilla/5.0');
  const hash2 = generateGuestKeyHash('103.21.244.2', 'v_fp_12345', 'Mozilla/5.0');
  const hashDiffIp = generateGuestKeyHash('103.21.244.99', 'v_fp_12345', 'Mozilla/5.0');

  assert.strictEqual(hash1, hash2);
  assert.notStrictEqual(hash1, hashDiffIp);
  assert.strictEqual(hash1.length, 64); // SHA-256 hex length
});

// 5. Proxy IP Extraction Tests
test('Security: IP extraction handles multiple forwarded proxy hops safely', () => {
  const mockReq = {
    headers: new Map([
      ['x-forwarded-for', '203.0.113.195, 70.41.3.18, 150.172.238.178'],
    ]),
  };
  const extracted = extractClientIp({
    headers: {
      get: (header) => mockReq.headers.get(header),
    },
  });
  assert.strictEqual(extracted, '203.0.113.195');
});

// 6. Thinking and Reasoning Format Tests
test('Reasoning: Parses <think> blocks and separates thoughts from response', () => {
  const rawText = '<think>\nThinking about GPU computing...\n</think>\n\nHere is the answer.';
  const match = rawText.match(/^<think>([\s\S]*?)<\/think>\s*([\s\S]*)$/);
  assert.ok(match);
  assert.strictEqual(match[1].trim(), 'Thinking about GPU computing...');
  assert.strictEqual(match[2].trim(), 'Here is the answer.');
});

// 7. Workflow: Dashboard Icon & In-place Login Tests
test('Workflow: index.html has conditional Dashboard button and member limit setup', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert.ok(indexHtml.includes('id="headerDashboardBtn"'), 'Must have header dashboard button');
  assert.ok(indexHtml.includes('id="sidebarDashboardLink"'), 'Must have sidebar dashboard link');
  assert.ok(indexHtml.includes('dashboard.html'), 'Must point to dashboard.html');
  assert.ok(indexHtml.includes("headerDashboardBtn.classList.remove('hidden')"), 'Must show dashboard on login');
  assert.ok(indexHtml.includes("headerDashboardBtn.classList.add('hidden')"), 'Must hide dashboard on logout');
  assert.ok(indexHtml.includes('maxRequests = 20'), 'Member must get 20 requests');
  assert.ok(indexHtml.includes('12 * 60 * 60 * 1000'), 'Member window must be 12 hours');
});

test('Workflow: chat stays viewport-locked with only message feeds scrolling', () => {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert.ok(indexHtml.includes("document.body.classList.add(`theme-${theme}`)"), 'Theme changes must preserve body layout classes');
  assert.ok(!indexHtml.includes('document.body.className ='), 'Theme changes must not replace the body class list');
  assert.ok(indexHtml.includes('window.openUpgradeModal = function()'), 'Static upgrade button must have a global modal handler');
  assert.ok(indexHtml.includes('id="headerUpgradeBtn" onclick="openUpgradeModal()"'), 'Static header upgrade button must open the modal');
  assert.ok(indexHtml.includes('id="upgradeModal"'), 'Static page must contain the upgrade modal');
  assert.ok(indexHtml.includes('height: 100dvh'), 'Static chat page must use the dynamic viewport height');
  assert.ok(indexHtml.includes('id="mainWorkspace"'), 'Static chat workspace must remain a bounded flex column');
  assert.ok(indexHtml.includes('id="chatFeed" class="flex-1 min-h-0 overflow-y-auto'), 'Static message feed must own vertical scrolling');
  assert.ok(indexHtml.includes('overflow-hidden bg-[var(--bg-secondary)] border-r'), 'Static sidebar must not scroll as a panel');
  assert.ok(indexHtml.includes('flex-shrink-0 z-20'), 'Static composer must remain docked below the message feed');

  const page = fs.readFileSync('app/page.jsx', 'utf8');
  assert.ok(page.includes("document.body.classList.add('ai-chat-page')"), 'React chat route must lock body scrolling');
  assert.ok(page.includes('ai-chat-app flex h-[100dvh]'), 'React chat workspace must use the dynamic viewport height');
  assert.ok(page.includes('setUpgradeModalOpen(true)'), 'React upgrade button must open the upgrade modal');
  assert.ok(page.includes('<UpgradeModal'), 'React chat route must render the upgrade modal');

  const chatWindow = fs.readFileSync('components/ChatWindow.jsx', 'utf8');
  assert.ok(chatWindow.includes('overflow-y-auto overscroll-y-contain'), 'React message feed must own vertical scrolling');
  assert.ok(chatWindow.includes('w-full min-w-0 flex-wrap items-center justify-between'), 'Mobile header actions must wrap instead of overflowing');
  assert.ok(chatWindow.includes('whitespace-nowrap'), 'Sign In must remain fully visible on narrow screens');
  const chatSidebar = fs.readFileSync('components/ChatSidebar.jsx', 'utf8');
  assert.ok(chatSidebar.includes('min-h-0 flex-shrink-0 flex-col justify-between overflow-hidden'), 'React sidebar must remain a fixed non-scrolling panel');
  assert.ok(chatSidebar.includes('overflow-y-auto overscroll-y-contain'), 'Conversation history must scroll inside the fixed sidebar');
});

test('Workflow: React components render Dashboard only for logged-in user without external redirect', () => {
  const chatWindow = fs.readFileSync('components/ChatWindow.jsx', 'utf8');
  assert.ok(chatWindow.includes('LayoutDashboard'), 'ChatWindow must import/use LayoutDashboard');
  assert.ok(chatWindow.includes('dashboard.html'), 'ChatWindow must link to dashboard.html');
  assert.ok(chatWindow.includes('!user ?') && chatWindow.includes('User Dashboard Link'), 'ChatWindow must check user before showing Dashboard');

  const chatSidebar = fs.readFileSync('components/ChatSidebar.jsx', 'utf8');
  assert.ok(chatSidebar.includes('LayoutDashboard'), 'ChatSidebar must import/use LayoutDashboard');
  assert.ok(chatSidebar.includes('dashboard.html'), 'ChatSidebar must link to dashboard.html');
  assert.ok(chatSidebar.includes('{user &&'), 'ChatSidebar must check user before showing Dashboard');

  const settingsPanel = fs.readFileSync('components/SettingsPanel.jsx', 'utf8');
  assert.ok(settingsPanel.includes('LayoutDashboard'), 'SettingsPanel must import/use LayoutDashboard');
  assert.ok(settingsPanel.includes('dashboard.html'), 'SettingsPanel must link to dashboard.html');

  const authModal = fs.readFileSync('components/AuthModal.jsx', 'utf8');
  assert.ok(authModal.includes('handleGoogleSignIn'), 'AuthModal must support Google Sign-In');
  assert.ok(authModal.includes('window.location.pathname'), 'AuthModal must return user to AI page');
});

test('Branding: Settings footer credits HarshGuruJi instead of infrastructure providers', () => {
  const settingsPanel = fs.readFileSync('components/SettingsPanel.jsx', 'utf8');
  assert.ok(settingsPanel.includes('By HarshGuruJi'), 'Settings footer must credit HarshGuruJi');
  assert.ok(!settingsPanel.includes('Powered by NVIDIA'), 'Settings footer must not expose provider attribution');
});

// 8. AI Dashboard & Admin Panel Integration Tests
test('Workflow: dashboard.html and Next.js route exist with complete settings & quota analytics', () => {
  const dashHtml = fs.readFileSync('dashboard.html', 'utf8');
  assert.ok(dashHtml.includes('Live AI Usage Allowance'), 'Must show live allowance section');
  assert.ok(dashHtml.includes('resetTimerText'), 'Must show rolling reset timer');
  assert.ok(dashHtml.includes('setStudioTheme'), 'Must include theme settings');
  assert.ok(dashHtml.includes('setStudioLang'), 'Must include language settings');
  assert.ok(dashHtml.includes('tempSlider'), 'Must include creativity temperature');
  assert.ok(dashHtml.includes('conversationsContainer'), 'Must include chat history manager');
  assert.ok(dashHtml.includes('webguruji.online/dashboard.html'), 'Must link to main site dashboard');

  const dashReact = fs.readFileSync('app/dashboard/page.jsx', 'utf8');
  assert.ok(dashReact.includes('Live AI Quota &amp; Allowance'), 'React route must display quota');
  assert.ok(dashReact.includes('handleSetTheme'), 'React route must support themes');
  assert.ok(dashReact.includes('handleSetLang'), 'React route must support language');
});

const siteAdminPath = path.join(siteRepoRoot, 'admin.html');
const storeAdminPath = path.join(storeRepoRoot, 'admin.html');
if (fs.existsSync(siteAdminPath) && fs.existsSync(storeAdminPath)) {
  test('Workflow: Main Admin Panels contain GuruAI Command Center integration', () => {
    const siteAdmin = fs.readFileSync(siteAdminPath, 'utf8');
    assert.ok(siteAdmin.includes("switchMasterTab('guruai')"), 'site/admin.html must have guruai tab trigger');
    assert.ok(siteAdmin.includes('id="pane-guruai"'), 'site/admin.html must have pane-guruai');
    assert.ok(siteAdmin.includes('tile-guruai-app'), 'site/admin.html must have GuruAI stat tile');
    assert.ok(siteAdmin.includes('https://ai.webguruji.online/admin.html'), 'site/admin.html must link to AI admin');

    const storeAdmin = fs.readFileSync(storeAdminPath, 'utf8');
    assert.ok(storeAdmin.includes("switchMasterTab('guruai')"), 'store/admin.html must have guruai tab trigger');
    assert.ok(storeAdmin.includes('id="pane-guruai"'), 'store/admin.html must have pane-guruai');
    assert.ok(storeAdmin.includes('tile-guruai-app'), 'store/admin.html must have GuruAI stat tile');
  });
} else {
  console.log('⏭️ SKIP: Admin integration checks require the site and store repositories.');
}

// 9. Model Identity & Image Quota Policy Tests
test('Model Identity: System prompt and UI show Guru-Flash 1.1 and conceal Nemotron', () => {
  const prompt = buildSystemPrompt('english');
  assert.ok(prompt.includes('Guru-Flash 1.1'), 'System prompt must mandate Guru-Flash 1.1');
  assert.ok(prompt.includes('NEVER reveal, mention, or output "Nemotron"'), 'System prompt must forbid Nemotron output');

  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert.ok(indexHtml.includes('Guru-Flash 1.1 & SDXL'), 'index.html badge must show Guru-Flash 1.1 & SDXL');
  assert.ok(!indexHtml.includes('Nemotron 3 Ultra 550B & SDXL'), 'index.html badge must NOT show Nemotron');

  const dashHtml = fs.readFileSync('dashboard.html', 'utf8');
  assert.ok(dashHtml.includes('Guru-Flash 1.1'), 'dashboard.html must show Guru-Flash 1.1');
});

test('Image Quota Policy: Enforces 5 images in 24 hours per registered user and blocks guests', () => {
  const rateLimitSrc = fs.readFileSync('lib/rate-limit.js', 'utf8');
  assert.ok(rateLimitSrc.includes('USER_IMAGE_MAX_REQUESTS = 5'), 'Must be exactly 5 images');
  assert.ok(rateLimitSrc.includes('USER_IMAGE_WINDOW_SECONDS = 24 * 60 * 60'), 'Must be 24-hour window');
});

// 10. Admin Gate Security & Clean Route Mirroring Tests
test('Admin Gate Security: Enforces master credentials, anti-bruteforce, and required placeholders', () => {
  const adminHtml = fs.readFileSync('admin.html', 'utf8');
  assert.ok(adminHtml.includes('placeholder="enter your private mail"'), 'Must have placeholder "enter your private mail"');
  assert.ok(adminHtml.includes('placeholder="your Secret ID"'), 'Must have placeholder "your Secret ID"');
  assert.ok(adminHtml.includes('harshguruji01@gmail.com'), 'Must verify against harshguruji01@gmail.com');
  assert.ok(adminHtml.includes('2547277654'), 'Must verify against Secret ID 2547277654');
  assert.ok(adminHtml.includes('MAX_GATE_ATTEMPTS = 3'), 'Must have 3 max attempts before lockout');
  assert.ok(adminHtml.includes('15 * 60 * 1000'), 'Must have 15-minute anti-bruteforce lock');
  assert.ok(adminHtml.includes('60 * 60 * 1000'), 'Must have 1-hour session duration');
});

test('Clean Routing: 404 smart routing and login page exist with directory mirroring in CI/CD', () => {
  assert.ok(fs.existsSync('login.html'), 'login.html must exist at repository root');
  assert.ok(fs.existsSync('404.html'), '404.html must exist at repository root');
  assert.ok(fs.existsSync('public/login.html'), 'public/login.html must exist');
  assert.ok(fs.existsSync('public/404.html'), 'public/404.html must exist');

  const router404 = fs.readFileSync('404.html', 'utf8');
  assert.ok(router404.includes('/login'), '404.html must handle /login route');
  assert.ok(router404.includes('/dashboard'), '404.html must handle /dashboard route');
  assert.ok(router404.includes('/admin'), '404.html must handle /admin route');

  const workflow = fs.readFileSync('.github/workflows/nextjs.yml', 'utf8');
  assert.ok(workflow.includes('./out/login'), 'CI/CD must mirror ./out/login');
  assert.ok(workflow.includes('./out/dashboard'), 'CI/CD must mirror ./out/dashboard');
  assert.ok(workflow.includes('./out/admin'), 'CI/CD must mirror ./out/admin');
  assert.ok(workflow.includes('./out/login/index.html'), 'CI/CD must mirror login index.html');
  assert.ok(workflow.includes('./out/dashboard/index.html'), 'CI/CD must mirror dashboard index.html');
  assert.ok(workflow.includes('./out/admin/index.html'), 'CI/CD must mirror admin index.html');
});

// 11. Hostinger Mail MCP Integration Tests
test('Hostinger Mail: Mailbox configuration, send utility and MCP server exist', () => {
  assert.ok(fs.existsSync('lib/mail.js'), 'lib/mail.js must exist');
  assert.ok(fs.existsSync('app/api/mail/send/route.js'), 'app/api/mail/send/route.js must exist');
  const mailLib = fs.readFileSync('lib/mail.js', 'utf8');
  assert.ok(mailLib.includes('info@webguruji.online'), 'Default sender must be info@webguruji.online');
  assert.ok(mailLib.includes('AC955bc6c100d79999a2c5613002ee'), 'Mailbox resource ID must match');
  assert.ok(mailLib.includes('api.mail.hostinger.com'), 'Must use api.mail.hostinger.com endpoint');

});

const mcpConfigFile = process.env.MCP_CONFIG_PATH || 'C:/Users/harsh/.gemini/config/mcp_config.json';
if (fs.existsSync(mcpConfigFile)) {
  test('Hostinger MCP: local configuration registers the mail server', () => {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigFile, 'utf8'));
    assert.ok(mcpConfig.mcpServers['hostinger-mail'], 'hostinger-mail server must be registered in mcp_config.json');
  });
} else {
  console.log('⏭️ SKIP: Local Hostinger MCP config is not available on this runner.');
}

test('Welcome Email: HTML template generation and CORS support in mail route', () => {
  const mailLib = fs.readFileSync('lib/mail.js', 'utf8');
  assert.ok(mailLib.includes('generateWelcomeEmailHtml'), 'Must export generateWelcomeEmailHtml');
  assert.ok(mailLib.includes('sendWelcomeEmail'), 'Must export sendWelcomeEmail');

  const routeSrc = fs.readFileSync('app/api/mail/send/route.js', 'utf8');
  assert.ok(routeSrc.includes('OPTIONS'), 'Must implement OPTIONS preflight method');
  assert.ok(routeSrc.includes('Access-Control-Allow-Origin'), 'Must include CORS headers');
  assert.ok(routeSrc.includes('sendWelcomeEmail'), 'Must support welcome email dispatch');
});

test('Task 1 & 2: Welcome Email template reflects login source (AI Hub vs Main Site)', () => {
  const mailLib = fs.readFileSync('lib/mail.js', 'utf8');
  assert.ok(mailLib.includes("source === 'ai'"), 'Must distinguish between AI and Main source');
  assert.ok(mailLib.includes('GuruAI by HarshGuruJi'), 'Must include GuruAI brand for AI login');
  assert.ok(mailLib.includes('HarshGuruJi <info@webguruji.online>'), 'Must include HarshGuruJi sender for main login');
  assert.ok(mailLib.includes('https://webguruji.online'), 'Must link to Main site domain');
  assert.ok(!mailLib.includes('www.webguruji.online'), 'Must not link to www.webguruji.online');
});

test('Task 3: 6-Digit Email Verification Code generation and API routes exist', () => {
  const mailLib = fs.readFileSync('lib/mail.js', 'utf8');
  assert.ok(mailLib.includes('generateVerificationCodeHtml'), 'Must export generateVerificationCodeHtml');
  assert.ok(mailLib.includes('sendVerificationCodeEmail'), 'Must export sendVerificationCodeEmail');
  assert.ok(mailLib.includes('info@webguruji.online'), 'Must send OTP from info@webguruji.online');

  assert.ok(fs.existsSync('app/api/auth/send-login-code/route.js'), 'send-login-code API route must exist');
  const sendRoute = fs.readFileSync('app/api/auth/send-login-code/route.js', 'utf8');
  assert.ok(sendRoute.includes('sendVerificationCodeEmail'), 'send-login-code must call sendVerificationCodeEmail');
  assert.ok(sendRoute.includes('Access-Control-Allow-Origin'), 'send-login-code must have CORS support');

  assert.ok(fs.existsSync('app/api/auth/verify-login-code/route.js'), 'verify-login-code API route must exist');
  const verifyRoute = fs.readFileSync('app/api/auth/verify-login-code/route.js', 'utf8');
  assert.ok(verifyRoute.includes('createHmac'), 'verify-login-code must use HMAC signature validation');
  assert.ok(verifyRoute.includes('sendWelcomeEmail'), 'verify-login-code must send welcome email for new users');
});

const siteAuthPath = path.join(siteRepoRoot, 'js', 'auth.js');
const siteLoginPath = path.join(siteRepoRoot, 'login.html');
if (fs.existsSync(siteAuthPath) && fs.existsSync(siteLoginPath)) {
  test('Task 3: Main site login portal implements email verification code flow', () => {
    const siteAuth = fs.readFileSync(siteAuthPath, 'utf8');
    assert.ok(siteAuth.includes('sendLoginVerificationCode'), 'site/js/auth.js must export sendLoginVerificationCode');
    assert.ok(siteAuth.includes('verifyLoginCode'), 'site/js/auth.js must export verifyLoginCode');
    assert.ok(!siteAuth.includes('const userEmail = (user.email || \'\').toLowerCase();\n    const isOwner'), 'Duplicate userEmail must be eliminated');

    const siteLogin = fs.readFileSync(siteLoginPath, 'utf8');
    assert.ok(siteLogin.includes('sendLoginVerificationCode'), 'site login.html must use sendLoginVerificationCode');
    assert.ok(siteLogin.includes('verifyLoginCode'), 'site login.html must use verifyLoginCode');
  });
} else {
  console.log('⏭️ SKIP: Main site login checks require the site repository.');
}

test('Task 3: AI login portal implements email verification code flow', () => {
  const aiLogin = fs.readFileSync('login.html', 'utf8');
  assert.ok(aiLogin.includes('send-login-code'), 'ai login.html must invoke send-login-code');
  assert.ok(aiLogin.includes('verify-login-code'), 'ai login.html must invoke verify-login-code');
  assert.ok(aiLogin.includes('loginOtpSection'), 'ai login.html must have loginOtpSection');
});


console.log(`\n========================================`);
console.log(`Test Summary: ${passedTests} passed, ${failedTests} failed.`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
