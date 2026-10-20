/**
 * NVIDIA NIM API Client
 * Text model: meta/llama-3.1-70b-instruct (with real streaming support)
 * Image model: stabilityai/stable-diffusion-xl
 */

export function buildSystemPrompt(language = 'english') {
  const lang = (language || 'english').toLowerCase();

  const brandIntro = `You are GuruAI, a world-class, helpful, highly capable, and secure AI assistant created by HarshGuruJi (https://ai.webguruji.online).`;

  if (lang === 'hinglish') {
    return `${brandIntro}
Language Guideline: You MUST respond in fluent, natural Hinglish (conversational Hindi words written using Latin/English script, widely used and loved across India, e.g. "Haan zaroor! Main aapki madad karta hoon. Yeh code dekhiye:").
Formatting: Use clear, structured Markdown. For code, always use triple backtick fenced code blocks with the language identifier.`;
  }

  if (lang === 'hindi') {
    return `${brandIntro}
Language Guideline: You MUST respond in pure, polite Hindi in standard Devanagari script (e.g. "नमस्ते! मैं GuruAI हूँ। मैं आपकी किस प्रकार सहायता कर सकता हूँ?").
Formatting: Maintain clean Markdown, proper Unicode characters, and code snippets in fenced code blocks.`;
  }

  return `${brandIntro}
Language Guideline: Respond in clear, professional, and articulate English.
Formatting: Provide comprehensive, well-structured answers using clean Markdown headers, lists, and syntax-highlighted code blocks.`;
}

/**
 * Checks if the prompt expresses clear intent to generate an image
 */
export function isImageIntent(prompt = '') {
  const lower = prompt.toLowerCase().trim();

  // Guard against code or technical questions about images
  const technicalCodeKeywords = [
    'html',
    'css',
    'docker',
    'opencv',
    'tag',
    '<img>',
    'npm',
    'component',
    'code',
    'syntax',
    'optimize',
    'file size',
    'compression',
    'upload',
    'resizing function',
  ];
  if (technicalCodeKeywords.some((tech) => lower.includes(tech))) {
    return false;
  }

  const imageTriggers = [
    'generate image',
    'generate an image',
    'generate a photo',
    'generate photo',
    'create image',
    'create an image',
    'create a picture',
    'create picture',
    'draw image',
    'draw an image',
    'draw a picture',
    'draw picture',
    'draw me',
    'paint a picture',
    'paint an image',
    'illustrate an image',
    'illustrate a picture',
    'render an image',
    'make an image of',
    'make a picture of',
    'visualize an image',
  ];

  return imageTriggers.some((t) => lower.includes(t));
}

/**
 * Streams text completion from NVIDIA NIM API
 */
export async function streamNvidiaTextChat({ messages, language = 'english', signal }) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === 'nvapi-placeholder-key') {
    throw new Error(
      'NVIDIA API Key is missing. Please set a valid NVIDIA_API_KEY from https://build.nvidia.com in your server environment variables.'
    );
  }

  const baseUrl = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.NVIDIA_TEXT_MODEL || 'meta/llama-3.1-70b-instruct';

  const systemMessage = {
    role: 'system',
    content: buildSystemPrompt(language),
  };

  const payload = {
    model,
    messages: [systemMessage, ...messages],
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 2048,
    stream: true,
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`NVIDIA API HTTP ${response.status}:`, errorBody);
    if (response.status === 401) {
      throw new Error('NVIDIA API authentication failed. Verify NVIDIA_API_KEY.');
    }
    if (response.status === 429) {
      throw new Error('Upstream NVIDIA NIM API rate limit exceeded. Please try again shortly.');
    }
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  return response.body;
}

/**
 * Generates an image using NVIDIA NIM SDXL endpoint and returns image binary buffer
 */
export async function generateNvidiaImage({ prompt }) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey === 'nvapi-placeholder-key') {
    throw new Error(
      'NVIDIA API Key is missing. Please set NVIDIA_API_KEY in your server environment variables.'
    );
  }

  const model = process.env.NVIDIA_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl';

  // Primary GenAI Endpoint on NVIDIA
  const genAiUrl = 'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl';
  let response = await fetch(genAiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      sampler: 'K_DPM_2_ANCESTRAL',
      seed: 0,
      steps: 25,
    }),
  });

  if (response.ok) {
    const json = await response.json();
    const base64Data = json.artifacts?.[0]?.base64;
    if (base64Data) {
      return Buffer.from(base64Data, 'base64');
    }
  }

  // Fallback: OpenAI-compatible format if deployed on integrate.api.nvidia.com
  const baseUrl = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('NVIDIA Image Generation Error:', response.status, errText);
    throw new Error(`NVIDIA Image API failed (${response.status}): ${errText.slice(0, 180)}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    return Buffer.from(b64, 'base64');
  }

  const imageUrl = data.data?.[0]?.url;
  if (imageUrl) {
    const imgFetch = await fetch(imageUrl);
    const arrBuf = await imgFetch.arrayBuffer();
    return Buffer.from(arrBuf);
  }

  throw new Error('NVIDIA returned an unexpected image response format.');
}
