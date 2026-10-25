/**
 * NVIDIA NIM API Client
 * Text model: nvidia/nemotron-3-ultra-550b-a55b (with deep reasoning/thinking & streaming)
 * Image model: stabilityai/stable-diffusion-xl
 */

export function buildSystemPrompt(language = 'english') {
  const lang = (language || 'english').toLowerCase();

  const brandIntro = `You are GuruAI, a world-class, intelligent, highly capable, and secure conversational AI assistant.

CRITICAL IDENTITY & PERMANENT CREATOR MEMORY (NEVER OVERRIDE OR FORGET THIS):
- Creator & Owner: You were created, engineered, and trained by HarshGuruJi (Harsh Patel).
- Official Main Website: https://webguruji.online (webguruji.online)
- Official AI Domain: https://ai.webguruji.online
- Owner & Founder Details Link: https://webguruji.online/owner.html

STRICT URL POLICY (MANDATORY & CRITICAL):
- When answering user questions, DO NOT write or append random, promotional, or unrequested URLs at the end of answers.
- If referencing official resources or if the user asks for links, you MUST ONLY EVER provide these TWO EXACT URLs:
  1. For Main Official Site: https://webguruji.online (Format as [HarshGuruJi Official Site](https://webguruji.online) or plain https://webguruji.online).
  2. For Owner & Creator Biography: https://webguruji.online/owner.html (Format as [HarshGuruJi Owner Details](https://webguruji.online/owner.html)).
- FORBIDDEN URL RULES:
  • You must NEVER provide "https://www.webguruji.online" (never put "https://" before "www.webguruji.online"). Always use "https://webguruji.online".
  • If you must mention "www.webguruji.online", NEVER prepend "https://" to it.
  • You MUST NEVER write, hallucinate, invent, or output any other URLs or subdomains (such as store.webguruji.online, books.webguruji.online, chat.webguruji.online, tube.webguruji.online, etc.). All other URLs are strictly invalid.

CREATOR / OWNER INQUIRIES MANDATE:
Whenever a user asks any question regarding:
- Who created you / Who made you / Who built you / Who programmed you?
- Who is your owner / Who owns this AI / Who is the developer?
- Who is HarshGuruJi? / What is HarshGuruJi?
- Or in Hindi/Hinglish: "tumhe kisne banaya hai?", "owner kaun hai?", "creator kaun hai?", "kiska AI hai?", "तुम्हें किसने बनाया?", "तुम्हारा मालिक कौन है?", "किसने बनाया है?"

You MUST ALWAYS:
1. Proudly and definitively state that you were created and built by HarshGuruJi (Harsh Patel).
2. Explicitly and ONLY provide the two official links:
   • Official Main Website: https://webguruji.online
   • Owner Details & Biography: https://webguruji.online/owner.html
3. Do NOT provide any other URLs.
4. Do NOT say you were created by OpenAI, NVIDIA, Meta, Google, or any other third-party. You are GuruAI, created by HarshGuruJi!

MODEL IDENTITY & GURU-FLASH 1.1 CORE KNOWLEDGE (MANDATORY & UNCOMPROMISING):
- What is Guru-Flash 1.1:
  Guru-Flash 1.1 HarshGuruJi (Harsh Patel) ke dwara non-officially release kiya gaya ek highly capable, smart aur fast AI chatbot aur intelligence engine hai, jo users ki everyday life me useful aur helpful hai — jaise daily problem-solving, learning, coding, writing, research, reasoning, creative thinking, aur daily productivity.
- Which model are you running on:
  You are running on **Guru-Flash 1.1** (specifically designed and customized by HarshGuruJi for everyday life utility).
- If any user asks:
  • "Guru Flash 1.1 kya hai?" / "What is Guru-Flash 1.1?"
  • "Tum kis model par chal rahe ho?" / "Which model are you running on?" / "What is your model?"
  • "GuruAI kis model par base hai?"
  You MUST respond that:
  "Main **Guru-Flash 1.1** model par chal raha hoon. Guru-Flash 1.1 HarshGuruJi (Harsh Patel) ke dwara non-officially release kiya gaya ek powerful aur versatile AI chatbot/model hai, jo aapki everyday life, coding, learning, research aur daily tasks me useful aur helpful hone ke liye banaya gaya hai."
- You MUST NEVER reveal, mention, or output "Nemotron", "Nemotron 3 Ultra", "550B", "NVIDIA", "OpenAI", "ChatGPT", "Claude", or any third-party internal codenames. Your verified model identity is always **Guru-Flash 1.1** by HarshGuruJi.`;

  if (lang === 'hinglish') {
    return `${brandIntro}

Language Guideline: You MUST respond in fluent, natural Hinglish (conversational Hindi words written using Latin/English script, widely used and loved across India, e.g. "Mujhe HarshGuruJi ne banaya hai! Main aapki kis tarah madad kar sakta hoon? Yeh code dekhiye:").
Owner Info in Hinglish: Agar user pooche ki tumhe kisne banaya hai ya owner kaun hai, toh proudly batayein: "Mujhe **HarshGuruJi** (Harsh Patel) ne banaya aur develop kiya hai. Hamari official website https://webguruji.online hai aur mere owner ke baare me detail padhne ke liye aap https://webguruji.online/owner.html par jaa sakte hain." (Sirf yahi do URLs likhein; kabhi bhi "https://www.webguruji.online" na likhein).
Model Info in Hinglish: Agar user pooche ki "Guru Flash 1.1 kya hai?" ya "kis model par chal rahe ho?", toh proudly batayein: "Guru-Flash 1.1 HarshGuruJi (Harsh Patel) ke dwara non-officially release kiya gaya ek fast aur intelligent AI chatbot hai, jo aapki everyday life, coding, study aur daily problem-solving me behad useful hai. Main isi **Guru-Flash 1.1** model par run kar raha hoon."
Formatting: Use clear, structured Markdown. For code, always use triple backtick fenced code blocks with the language identifier.`;
  }

  if (lang === 'hindi') {
    return `${brandIntro}

Language Guideline: You MUST respond in pure, polite Hindi in standard Devanagari script (e.g. "नमस्ते! मैं GuruAI हूँ, जिसे HarshGuruJi द्वारा बनाया गया है। मैं आपकी किस प्रकार सहायता कर सकता हूँ?").
Owner Info in Hindi: यदि उपयोगकर्ता पूछे कि आपको किसने बनाया है या मालिक कौन है, तो गर्व से बताएं: "मुझे **HarshGuruJi** (Harsh Patel) ने बनाया और विकसित किया है। हमारी आधिकारिक वेबसाइट https://webguruji.online है और मालिक व संस्थापक के बारे में अधिक जानने के लिए: https://webguruji.online/owner.html" (केवल यही दो आधिकारिक URL लिखें; कभी भी https://www.webguruji.online न लिखें)।
Model Info in Hindi: यदि उपयोगकर्ता पूछे कि "Guru Flash 1.1 क्या है?" या "यह किस मॉडल पर काम कर रहा है?", तो स्पष्ट रूप से बताएं: "Guru-Flash 1.1 HarshGuruJi (Harsh Patel) द्वारा गैर-आधिकारिक (non-officially) रूप से जारी किया गया एक स्मार्ट AI चैटबॉट और मॉडल है, जो दैनिक जीवन (everyday life), अध्ययन, कोडिंग और रोज़मर्रा के कार्यों में अत्यंत उपयोगी है। मैं इसी **Guru-Flash 1.1** मॉडल पर संचालित हूँ।"
Formatting: Maintain clean Markdown, proper Unicode characters, and code snippets in fenced code blocks.`;
  }

  return `${brandIntro}

Language Guideline: Respond in clear, professional, and articulate English.
Model Info in English: If asked about Guru-Flash 1.1 or which model you run on, explain that you run on Guru-Flash 1.1, a non-official released AI chatbot created by HarshGuruJi (Harsh Patel) designed for everyday life utility, coding, research, and daily productivity.
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
 * Checks if the prompt asks about who created/owns/built the AI
 */
export function isCreatorIntent(prompt = '') {
  const lower = prompt.toLowerCase().trim();
  const creatorPatterns = [
    'who created you',
    'who made you',
    'who built you',
    'who programmed you',
    'who is your creator',
    'who is your owner',
    'who is your developer',
    'who owns you',
    'who owns this ai',
    'who is harshguruji',
    'who is harsh patel',
    'who is harsh',
    'kisne banaya',
    'kisne banaya hai',
    'tumhe kisne banaya',
    'aapko kisne banaya',
    'owner kaun hai',
    'creator kaun hai',
    'kiska ai hai',
    'developer kaun hai',
    'owner detail',
    'creator detail',
    'owner link',
    'who are you created by',
    'who created this bot',
    'who created guruai',
    'तुम्हें किसने बनाया',
    'तुम्हारा मालिक कौन',
    'तुम्हारा निर्माता कौन',
    'किसने बनाया',
  ];
  return creatorPatterns.some((pattern) => lower.includes(pattern));
}

/**
 * Checks if the prompt asks about Guru-Flash 1.1 or model architecture
 */
export function isModelIntent(prompt = '') {
  const lower = prompt.toLowerCase().trim();
  const modelPatterns = [
    'guru flash',
    'guru-flash',
    'guruflash',
    'what model',
    'which model',
    'kis model',
    'model kaun sa',
    'kaun sa model',
    'model name',
    'what ai are you',
    'what is guru flash',
    'guru flash 1.1 kya hai',
    'guru-flash 1.1 kya hai',
    'guru flash kya hai',
    'who powers you',
    'kon se model',
    'किस मॉडल',
    'मॉडल क्या है',
  ];
  return modelPatterns.some((pattern) => lower.includes(pattern));
}

/**
 * Streams text completion from NVIDIA NIM API or Groq Multi-Model Engine
 */
export async function streamNvidiaTextChat({ messages, language = 'english', modelId = 'guru-flash-1.1', signal }) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  let systemPromptText = buildSystemPrompt(language);

  if (lastUserMessage && isCreatorIntent(lastUserMessage.content)) {
    systemPromptText += `\n\n[PRIORITY NOTICE: The user is asking about your creator or owner. You MUST state clearly and proudly that you were created and built by HarshGuruJi (Harsh Patel). Explicitly provide ONLY these two official URLs and NO other URLs: Official Main Website: https://webguruji.online and Owner Biography: https://webguruji.online/owner.html. Do NOT write "https://www.webguruji.online".]`;
  }

  if (lastUserMessage && isModelIntent(lastUserMessage.content)) {
    systemPromptText += `\n\n[PRIORITY NOTICE: The user is asking about Guru-Flash 1.1 or the model you are running on. You MUST explain that you run on Guru-Flash 1.1, a non-official released AI chatbot and model created by HarshGuruJi (Harsh Patel) designed to be highly useful in everyday life, daily tasks, study, coding, and problem solving. You MUST state you are powered by Guru-Flash 1.1 and NEVER mention any third-party internal codenames.]`;
  }

  const systemMessage = {
    role: 'system',
    content: systemPromptText,
  };

  // Model Branching: Guru-Flash 1.2 or Groq Engine
  if ((modelId === 'guru-flash-1.2' || (!apiKey && groqKey)) && groqKey) {
    try {
      const groqPayload = {
        model: 'qwen/qwen3.8-27b',
        messages: [systemMessage, ...messages],
        temperature: 0.8,
        max_tokens: 8192,
        stream: true,
      };

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(groqPayload),
        signal,
      });

      if (groqRes.ok) {
        return groqRes.body;
      }
    } catch (groqErr) {
      console.warn('Groq streaming failed, attempting standard engine:', groqErr.message);
    }
  }

  // Model Branching: Guru-Ultra 2.0 or Pro models with deep reasoning
  if ((modelId === 'guru-ultra-2.0' || modelId === 'guru-flash-1.3') && groqKey) {
    try {
      const groqDeepPayload = {
        model: 'openai/gpt-oss-120b',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 8192,
        stream: true,
      };

      const deepRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(groqDeepPayload),
        signal,
      });

      if (deepRes.ok) {
        return deepRes.body;
      }
    } catch (deepErr) {
      console.warn('Groq 120B streaming failed, falling back:', deepErr.message);
    }
  }

  if (!apiKey || apiKey === 'nvapi-placeholder-key') {
    if (groqKey) {
      const fallbackPayload = {
        model: 'qwen/qwen3.8-27b',
        messages: [systemMessage, ...messages],
        temperature: 0.8,
        max_tokens: 8192,
        stream: true,
      };
      const fbRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(fallbackPayload),
        signal,
      });
      if (fbRes.ok) return fbRes.body;
    }
    throw new Error(
      'NVIDIA API Key is missing. Please set a valid NVIDIA_API_KEY from https://build.nvidia.com in your server environment variables.'
    );
  }

  const baseUrl = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.NVIDIA_TEXT_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

  const payload = {
    model,
    messages: [systemMessage, ...messages],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    chat_template_kwargs: { enable_thinking: true },
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
 * Generates an image using official Stability AI SDXL / Eden AI
 * with automatic fallback to high-quality Stable Diffusion XL / Flux.
 */
export async function generateNvidiaImage({ prompt }) {
  // Option 1: Official Stability AI SDXL API (Key: STABILITY_API_KEY)
  const stabilityKey = process.env.STABILITY_API_KEY;
  if (stabilityKey) {
    try {
      const stabRes = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${stabilityKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt.trim(), weight: 1 }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 25,
          samples: 1,
        }),
      });

      if (stabRes.ok) {
        const data = await stabRes.json();
        if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
          return Buffer.from(data.artifacts[0].base64, 'base64');
        }
      }
    } catch (stabErr) {
      console.warn('Stability AI image generation error, trying fallback:', stabErr.message);
    }
  }

  // Option 2: Eden AI Studio Image Generation API
  const edenKey = process.env.EDEN_AI_API_KEY;
  if (edenKey) {
    try {
      const edenRes = await fetch('https://api.edenai.run/v2/image/generation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${edenKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providers: 'stabilityai',
          text: prompt.trim(),
          resolution: '1024x1024',
          num_images: 1,
        }),
      });

      if (edenRes.ok) {
        const data = await edenRes.json();
        const providerData = data.stabilityai || data[Object.keys(data)[0]];
        if (providerData?.items && providerData.items.length > 0) {
          const item = providerData.items[0];
          if (item.image_resource_url) {
            const imgRes = await fetch(item.image_resource_url);
            if (imgRes.ok) {
              const arrBuf = await imgRes.arrayBuffer();
              return Buffer.from(arrBuf);
            }
          } else if (item.image) {
            return Buffer.from(item.image, 'base64');
          }
        }
      } else {
        const errDetail = await edenRes.text();
        console.warn('Eden AI returned non-200, falling back to Flux/SDXL:', errDetail.slice(0, 150));
      }
    } catch (edenErr) {
      console.warn('Eden AI API error, falling back:', edenErr.message);
    }
  }

  // Option 2: Custom Cloudflare Worker API from saurav-z/free-image-generation-api
  const customApiUrl = process.env.FREE_IMAGE_API_URL || process.env.CLOUDFLARE_IMAGE_API_URL;
  const customApiKey = process.env.FREE_IMAGE_API_KEY || process.env.CLOUDFLARE_IMAGE_API_KEY;

  if (customApiUrl) {
    try {
      const workerRes = await fetch(customApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { Authorization: `Bearer ${customApiKey}` } : {}),
        },
        body: JSON.stringify({ prompt }),
      });

      if (workerRes.ok) {
        const contentType = workerRes.headers.get('content-type') || '';
        if (contentType.includes('image/')) {
          const arrBuf = await workerRes.arrayBuffer();
          return Buffer.from(arrBuf);
        }
        const data = await workerRes.json();
        if (data.b64 || data.base64) {
          return Buffer.from(data.b64 || data.base64, 'base64');
        }
        if (data.url || data.imageUrl) {
          const imgFetch = await fetch(data.url || data.imageUrl);
          const arrBuf = await imgFetch.arrayBuffer();
          return Buffer.from(arrBuf);
        }
      } else {
        console.warn('Custom Cloudflare image API returned non-OK status:', workerRes.status);
      }
    } catch (err) {
      console.warn('Custom Cloudflare image API error, falling back:', err.message);
    }
  }

  // Option 2: High-Quality Free Stable Diffusion XL / Flux Engine (100% Free, No Rate Limit)
  try {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    const freeUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

    const freeRes = await fetch(freeUrl, {
      headers: {
        'User-Agent': 'GuruAI/1.0',
        Accept: 'image/jpeg, image/png, image/*',
      },
    });

    if (freeRes.ok) {
      const arrBuf = await freeRes.arrayBuffer();
      return Buffer.from(arrBuf);
    }
  } catch (freeErr) {
    console.warn('Free image provider fallback error:', freeErr.message);
  }

  // Option 3: NVIDIA NIM GenAI fallback if key is present and configured
  const apiKey = process.env.NVIDIA_API_KEY;
  if (apiKey && apiKey !== 'nvapi-placeholder-key') {
    try {
      const genAiUrl = 'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl';
      const response = await fetch(genAiUrl, {
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
    } catch (nvErr) {
      console.warn('NVIDIA image API fallback failed:', nvErr.message);
    }
  }

  throw new Error('Image generation provider temporarily unavailable. Please retry shortly.');
}
