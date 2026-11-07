/**
 * HarshGuruJi AI (GuruAI) - Trusted Server-Side Pricing & Plan Configuration
 * Single source of truth for pricing. Client cannot override amount or currency.
 */

export const GURU_PLANS = {
  'guru-flash-1.3': {
    planId: 'guru-flash-1.3',
    name: 'Guru-Flash 1.3 (Starter Premium)',
    tier: 3,
    priceInr: 499,
    priceUsd: 5,
    currency: 'INR',
    contextLimit: 64000,
    dailyMessages: 150,
    durationDays: 30,
    allowedModels: ['guru-flash-1.1', 'guru-flash-1.2', 'guru-flash-1.3'],
    features: [
      'NVIDIA Nemotron 3.5 Bolt Reasoning Engine',
      'Extended Thinking Capability Enabled',
      '64,000 Token Context Window',
      '150 High-Priority Chats / 24h',
      'Multi-Turn Memory & Document Digest'
    ]
  },
  'guru-argon-1.4': {
    planId: 'guru-argon-1.4',
    name: 'Guru-Argon 1.4 (Power Scholar)',
    tier: 4,
    priceInr: 999,
    priceUsd: 15,
    currency: 'INR',
    contextLimit: 128000,
    dailyMessages: 250,
    durationDays: 30,
    allowedModels: ['guru-flash-1.1', 'guru-flash-1.2', 'guru-flash-1.3', 'guru-argon-1.4'],
    features: [
      'NVIDIA Ultra Deep Mathematical Logic Engine',
      '128,000 Token Massive Context Window',
      '250 High-Priority Chats / 24h',
      'Competitive Code Architecture & Scientific Research',
      'Multi-File Digest & High-Capacity Reasoning'
    ]
  },
  'guru-argon-1.5': {
    planId: 'guru-argon-1.5',
    name: 'Guru-Argon 1.5 (Grandmaster Enterprise)',
    tier: 5,
    priceInr: 1999,
    priceUsd: 25,
    currency: 'INR',
    contextLimit: 325000,
    dailyMessages: 350,
    durationDays: 30,
    allowedModels: ['guru-flash-1.1', 'guru-flash-1.2', 'guru-flash-1.3', 'guru-argon-1.4', 'guru-argon-1.5'],
    features: [
      'Mistral Large 1-Trillion Parameter A52B Ultra Engine',
      '325,000 Token Ultra-Massive Context Limit',
      'Native Multimodal Vision & Image Comprehension',
      '350 High-Priority Dedicated GPU Chats / 24h',
      'Full Textbook, Codebase & Scientific Ingestion',
      'VIP Priority GPU Inference Channel'
    ]
  }
};

/**
 * Validate and retrieve trusted plan details
 * @param {string} planId
 * @returns {object|null}
 */
export function getPlanDetails(planId) {
  if (!planId) return null;
  const normalized = planId.toLowerCase().trim();
  if (GURU_PLANS[normalized]) return GURU_PLANS[normalized];

  // Alias lookups
  if (normalized.includes('1.5') || normalized.includes('grandmaster')) return GURU_PLANS['guru-argon-1.5'];
  if (normalized.includes('1.4') || normalized.includes('scholar') || normalized.includes('power')) return GURU_PLANS['guru-argon-1.4'];
  if (normalized.includes('1.3') || normalized.includes('starter') || normalized.includes('pro')) return GURU_PLANS['guru-flash-1.3'];

  return null;
}
