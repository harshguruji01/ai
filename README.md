# GuruAI — Next-Generation AI Chatbot & Creative Studio

**Product Name:** GuruAI  
**Brand Owner:** HarshGuruJi  
**Official Subdomain:** [https://ai.webguruji.online](https://ai.webguruji.online)  
**Main Website:** [https://webguruji.online](https://webguruji.online)  

---

## 1. System Architecture

```
                      [ User Browser ]
                             │
                             ▼ (Shared Cookie Domain: .webguruji.online)
              [ Cloudflare / Reverse Proxy Edge ]
                             │
                             ▼
              [ Next.js 14 App Router (GuruAI) ]
   ├── Client: @supabase/ssr (Shared Cross-Domain Sessions)
   ├── Anti-Bypass: HMAC-SHA256(IP + Fingerprint + UA)
   ├── UI/UX: 3 Themes (Dark, Light, Cyberpunk), Stop/Retry, Responsive Drawer
   │
   ├──► [ PostgreSQL (Supabase) ]
   │      ├── usage_limits (Atomic reservation via reserve_usage_allowance RPC)
   │      ├── conversations & chat_messages (RLS Protected)
   │      ├── user_preferences (Theme, Typography, Language)
   │      └── Storage Bucket: generated-images (Private with Signed URLs)
   │
   └──► [ NVIDIA NIM API ]
          ├── Text Streaming: meta/llama-3.1-70b-instruct (SSE Chunks)
          └── Image Studio: stabilityai/stable-diffusion-xl
```

---

## 2. Core Features & Business Logic

### A. Seamless Cross-Subdomain Authentication
- Authentication is shared across `*.webguruji.online`.
- When a user logs in on `https://webguruji.online`, their authenticated session cookie is automatically recognized by `https://ai.webguruji.online` without secondary sign-in.
- Supabase clients are configured with cookie domain `.webguruji.online` in production and omit domain for seamless `localhost` testing.

### B. Concurrency-Safe Atomic Rate Limiting
- **Guest Users:**
  - Maximum **2 accepted text chats** per **6-hour rolling window**.
  - Tracked via privacy-preserving keyed hash `HMAC_SHA256(IP + Fingerprint + UA)`.
  - Image generation is strictly restricted to signed-in members.
  - Chats are ephemeral (never stored in the database).
- **Authenticated Users:**
  - Maximum **10 generation requests** per **12-hour rolling window**.
  - Tracked via verified `user_id`.
  - Full access to text chat and AI Image generation with Stable Diffusion XL.
  - Full chat persistence in `conversations` and `chat_messages`.
- **Atomic PostgreSQL Function:**
  - `reserve_usage_allowance` executes row-level locking (`FOR UPDATE`) to eliminate race conditions.
  - `refund_usage_allowance` safely refunds quota if upstream AI provider fails.

### C. NVIDIA NIM API Integration
- **Text Chat:** Streams completions from `meta/llama-3.1-70b-instruct` in real-time.
- **Image Studio:** Generates high-resolution images via `stabilityai/stable-diffusion-xl`, saves them in a private Supabase Storage bucket (`generated-images`), and provides 24-hour signed URLs.
- **Language Adaptability:** Dynamically injects system prompts for **English**, **Hinglish**, or **Hindi (Devanagari)**.

### D. Premium UI/UX Features
- **3 Distinct Visual Themes:**
  - **Dark Slate (Default):** Deep navy and charcoal surfaces with electric violet accents.
  - **Light Clean:** Minimalist soft-gray and white surfaces with high-contrast text.
  - **Cyberpunk Neon:** Matrix atmosphere with glowing cyan `#00ffcc` and violet accents.
- **Interactive Controls:**
  - Stop generation button (`AbortController`) to cancel active streams.
  - One-click response regeneration.
  - Categorized starter cards on welcome screen.
  - Date-grouped conversation history (Today, Yesterday, 7 Days, Older).
  - Floating scroll-to-bottom action.
  - Responsive mobile drawer navigation.

---

## 3. Environment Variables Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Populate the required credentials:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# NVIDIA NIM API Key
NVIDIA_API_KEY=nvapi-...
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_TEXT_MODEL=meta/llama-3.1-70b-instruct
NVIDIA_IMAGE_MODEL=stabilityai/stable-diffusion-xl

# Anti-Abuse & Rate Limiting Security
GUEST_ID_HMAC_SECRET=your_32_byte_random_hex_secret_here
TRUSTED_PROXY_CONFIGURATION=standard

# Domains
NEXT_PUBLIC_APP_URL=https://ai.webguruji.online
NEXT_PUBLIC_MAIN_SITE_URL=https://webguruji.online
NEXT_PUBLIC_COOKIE_DOMAIN=.webguruji.online
```

---

## 4. Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Build production bundle
npm run build

# 4. Start development server
npm run dev
```

---

## 5. Production Deployment

1. **Host on Vercel or Custom Node.js Server:**
   - Link repository and set environment variables.
   - Set custom domain to `ai.webguruji.online`.
2. **DNS & SSL:**
   - Add CNAME record for `ai` pointing to your deployment.
   - Verify SSL certificate covers `*.webguruji.online`.
3. **Supabase Auth Redirect URLs:**
   - In Supabase Dashboard > Authentication > URL Configuration:
     - Add `https://ai.webguruji.online/**` to **Redirect URLs**.
