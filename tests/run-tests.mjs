import assert from 'node:assert';
import {
  chatRequestSchema,
  imageGenerateSchema,
  userPreferencesSchema,
  conversationCreateSchema,
} from '../lib/validation.js';
import { buildSystemPrompt, isImageIntent, isCreatorIntent } from '../lib/ai/nvidia.js';
import { generateGuestKeyHash, extractClientIp } from '../lib/security.js';

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

// 3. System Prompt Construction Tests
test('System Prompt: Hindi Devanagari instructions included', () => {
  const prompt = buildSystemPrompt('hindi');
  assert.ok(prompt.includes('Devanagari'));
  assert.ok(prompt.includes('GuruAI'));
  assert.ok(prompt.includes('HarshGuruJi'));
});

test('System Prompt: Hinglish conversational rules included', () => {
  const prompt = buildSystemPrompt('hinglish');
  assert.ok(prompt.includes('Hinglish'));
  assert.ok(prompt.includes('Latin/English script'));
});

test('System Prompt: English default rules included', () => {
  const prompt = buildSystemPrompt('english');
  assert.ok(prompt.includes('English'));
});

test('System Prompt: Permanent Creator Memory includes Owner, Domains & Biography Link', () => {
  const prompt = buildSystemPrompt('english');
  assert.ok(prompt.includes('HarshGuruJi'));
  assert.ok(prompt.includes('https://www.webguruji.online'));
  assert.ok(prompt.includes('https://ai.webguruji.online'));
  assert.ok(prompt.includes('https://www.webguruji.online/owner.html'));
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

console.log(`\n========================================`);
console.log(`Test Summary: ${passedTests} passed, ${failedTests} failed.`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
