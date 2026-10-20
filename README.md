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
          ├── Text Streaming: nvidia/nemotron-3-ultra-550b-a55b (Deep Reasoning & SSE Chunks)
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
- **Text Chat:** Streams completions from `nvidia/nemotron-3-ultra-550b-a55b` with real-time deep reasoning (`reasoning_content`) and token streaming.
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

### E. Integrated Email Authentication & Password Recovery
- **Direct In-App Sign In & Registration:** Users can sign in or create accounts directly from the AI platform using Email & Password.
- **Forgot Password with "Send Code to Mail":**
  - Users request a password recovery code sent to their registered email address.
  - Implements a 60-second cooldown timer to prevent SMTP spam and rate-limit hits.
  - Allows entering the 6-digit verification code directly on-site to set a new password (`supabase.auth.verifyOtp` + `supabase.auth.updateUser`), or clicking the email recovery link directly.
- **Dedicated `/login` Window:** Full-screen responsive authentication portal at `https://ai.webguruji.online/login` synchronized with the main AI workspace.
- **Standalone `index.html`:** Zero-build single-file version for direct local browser execution or GitHub Pages deployment with embedded Supabase JS SDK.

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
NVIDIA_TEXT_MODEL=nvidia/nemotron-3-ultra-550b-a55b
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

## 4. Local Development, Quality & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (13/13 unit tests)
npm test

# 3. Run ESLint code quality check
npm run lint

# 4. Build production bundle (standalone output)
npm run build

# 5. Start development server
npm run dev
```

---

## 5. Deployment Options

### Option A: Docker Container (Recommended)
```bash
# Build and run with docker-compose
docker compose up -d --build
```

### Option B: VPS Deployment Script
A production-ready Ubuntu setup script is provided in `deploy/setup-vps.sh`:
```bash
chmod +x deploy/setup-vps.sh
./deploy/setup-vps.sh
```

### Option C: GitHub Pages / Direct Browser Access
Open `index.html` directly in any web browser or activate GitHub Pages on `main` / `root` to run the standalone GuruAI studio with no backend needed.

---

## 6. Supabase URL Configuration

In Supabase Dashboard > Authentication > URL Configuration:
- **Site URL:** `https://webguruji.online`
- **Redirect URLs:**
  - `https://ai.webguruji.online/**`
  - `https://webguruji.online/**`
  - `http://localhost:3000/**`

