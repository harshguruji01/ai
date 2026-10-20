/**
 * Cloudflare Worker for Free AI Image Generation (100,000 calls/day free tier)
 * Source: https://github.com/saurav-z/free-image-generation-api
 *
 * Deployment Guide:
 * 1. Go to Cloudflare Dashboard -> Workers & Pages -> Create Application -> Create Worker
 * 2. Name: "guruai-image-generator" (or any name)
 * 3. In the editor, paste this file contents and click "Save and Deploy"
 * 4. Go to Settings -> Variables -> Environment Variables:
 *    Add variable: API_KEY = "your-secret-api-key"
 * 5. Under Settings -> Variables -> Service Bindings:
 *    Add binding: Variable name = "AI", Service = "Workers AI"
 * 6. Copy your worker URL (e.g. https://guruai-image-generator.<subdomain>.workers.dev)
 * 7. Add to your .env.local:
 *    FREE_IMAGE_API_URL=https://guruai-image-generator.<subdomain>.workers.dev
 *    FREE_IMAGE_API_KEY=your-secret-api-key
 */

export default {
  async fetch(request, env) {
    const API_KEY = env.API_KEY;
    const url = new URL(request.url);
    const auth = request.headers.get("Authorization");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }

    // 🔐 Optional API key check (if API_KEY is set in environment)
    if (API_KEY && auth !== `Bearer ${API_KEY}`) {
      return json({ error: "Unauthorized: Invalid or missing API key" }, 401);
    }

    // 🚫 Only allow POST requests
    if (request.method !== "POST") {
      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    try {
      const { prompt } = await request.json();

      if (!prompt) return json({ error: "Prompt is required" }, 400);

      // Available Free AI Models in Cloudflare Workers AI:
      // - "@cf/stabilityai/stable-diffusion-xl-base-1.0"
      // - "@cf/bytedance/stable-diffusion-xl-lightning"
      // - "@cf/blackforestlabs/flux-1-schnell"
      // - "@cf/lykon/dreamshaper-8-lcm"

      const model = env.IMAGE_MODEL || "@cf/stabilityai/stable-diffusion-xl-base-1.0";

      // 🧠 Generate image from prompt
      const result = await env.AI.run(model, { prompt });

      return new Response(result, {
        headers: {
          "Content-Type": "image/jpeg",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return json({ error: "Failed to generate image", details: err.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
