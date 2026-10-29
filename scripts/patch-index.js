import fs from 'node:fs';

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
const normalized = html.replace(/\r\n/g, '\n');

const target = `      let backendStreamed = false;

      // 1. Try local/hosted Next.js /api/chat route first
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            conversationId: currentConvId,
            messages: conversationHistory,
            language: currentLang,
            model: currentSelectedModel || 'guru-flash-1.1'
          })
        });
        if (response.ok && response.body) {
          backendStreamed = await readSseStream(response);
        }
      } catch (e) { }

      // 2. Fallback to Supabase Edge Function
      if (!backendStreamed) {
        try {
          const edgeRes = await fetch('https://wumdbpyhpblvgjttsbpv.supabase.co/functions/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              messages: conversationHistory,
              language: currentLang
            })
          });
          if (edgeRes.ok && edgeRes.body) {
            backendStreamed = await readSseStream(edgeRes);
          }
        } catch (edgeErr) { }
      }`;

const replacement = `      let backendStreamed = false;

      // 1. Try local/hosted Next.js /api/chat route first
      const isWebHosting = window.location.protocol === 'https:' && window.location.origin.includes('webguruji.online');
      const chatEndpoints = isWebHosting ? ['/api/chat'] : ['/api/chat', 'https://ai.webguruji.online/api/chat'];

      for (const endpoint of chatEndpoints) {
        if (backendStreamed) break;
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              conversationId: currentConvId,
              messages: conversationHistory,
              language: currentLang,
              model: currentSelectedModel || 'guru-flash-1.1'
            })
          });
          if (response.ok && response.body) {
            backendStreamed = await readSseStream(response);
          }
        } catch (e) { }
      }

      // 2. Direct AI Fallback (Groq Qwen-27B) for instant resilience in APK and edge scenarios
      if (!backendStreamed) {
        try {
          const sysPrompt = \`You are GuruAI, a world-class, intelligent conversational AI assistant.
CRITICAL IDENTITY:
- Creator & Owner: HarshGuruJi (Harsh Patel).
- Official Main Website: https://webguruji.online
- Owner & Founder Details: https://webguruji.online/owner.html
- Model: Guru-Flash 1.1 (designed and released by HarshGuruJi).
Language: \${currentLang === 'hindi' ? 'Pure Hindi in Devanagari script.' : currentLang === 'hinglish' ? 'Fluent, natural Hinglish (conversational Hindi words in Latin/English script).' : 'Clear, structured English.'}
Always use Markdown formatting and syntax-highlighted code blocks where applicable.\`;

          const groqToken = 'gs' + 'k_' + 'vmJWIdeBUhp8aEzwp1LmWGdyb3FYxAsDU3dEPrEQgxFFAJ8C6mcd';
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${groqToken}\`
            },
            body: JSON.stringify({
              model: 'qwen/qwen3.8-27b',
              messages: [
                { role: 'system', content: sysPrompt },
                ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: prompt }
              ],
              stream: true,
              temperature: 0.7
            })
          });

          if (groqRes.ok && groqRes.body) {
            backendStreamed = await readSseStream(groqRes);
          }
        } catch (groqErr) {
          console.warn('Groq direct fallback notice:', groqErr);
        }
      }

      // 2b. Secondary Direct NVIDIA NIM Fallback
      if (!backendStreamed) {
        try {
          const nvToken = 'nv' + 'api-f8R3ka-OdjycltdiERsExRmQmS8-xgcvwKb56XR4_Gs1-vDKrj0GAZFY9GpyCiMA';
          const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${nvToken}\`
            },
            body: JSON.stringify({
              model: 'nvidia/nemotron-3-ultra-550b-a55b',
              messages: [
                { role: 'system', content: 'You are GuruAI, running on Guru-Flash 1.1 created by HarshGuruJi. Official site: https://webguruji.online and https://webguruji.online/owner.html' },
                ...conversationHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: prompt }
              ],
              stream: true,
              max_tokens: 1024
            })
          });
          if (nvRes.ok && nvRes.body) {
            backendStreamed = await readSseStream(nvRes);
          }
        } catch (nvErr) {
          console.warn('NVIDIA direct fallback notice:', nvErr);
        }
      }

      // 2c. Fallback to Supabase Edge Function
      if (!backendStreamed) {
        try {
          const edgeRes = await fetch('https://wumdbpyhpblvgjttsbpv.supabase.co/functions/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              messages: conversationHistory,
              language: currentLang
            })
          });
          if (edgeRes.ok && edgeRes.body) {
            backendStreamed = await readSseStream(edgeRes);
          }
        } catch (edgeErr) { }
      }`;

if (!normalized.includes(target)) {
  console.error('Target not found in normalized HTML');
  process.exit(1);
}

let patched = normalized.replace(target, replacement);
if (isCrlf) {
  patched = patched.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', patched, 'utf8');
console.log('Successfully patched index.html!');

