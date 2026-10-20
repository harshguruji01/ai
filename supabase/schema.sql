-- ==============================================================================
-- AI.WEBGURUJI.ONLINE - SUPABASE DATABASE SCHEMA
-- Production Schema for Chatbot, Cross-Subdomain Auth, Anti-Bypass Rate Limiting
-- ==============================================================================

-- 1. Create USAGE LIMITS Table (Strict Rate Limiting & Anti-Bypass)
-- Tracks Guest users via `guest_<IP>_<Fingerprint>` and Logged-in users via `user_<UUID>`
CREATE TABLE IF NOT EXISTS public.usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT UNIQUE NOT NULL, -- 'guest_<IP>_<Fingerprint>' OR 'user_<UUID>'
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_guest BOOLEAN NOT NULL DEFAULT true,
    chat_count INT NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast queries during rate-check
CREATE INDEX IF NOT EXISTS idx_usage_limits_identifier ON public.usage_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON public.usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_window_start ON public.usage_limits(window_start);

-- 2. Create CHAT HISTORY Table (Logged-in User Chats & Persistence)
-- Guests are NOT saved to keep DB light and respect privacy.
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL DEFAULT 'default',
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON public.chat_history(user_id, session_id);

-- 3. Create USER PREFERENCES Table (Logged-in User Customization)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'cyberpunk')),
    font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    font_family TEXT NOT NULL DEFAULT 'sans' CHECK (font_family IN ('sans', 'serif', 'mono')),
    ai_language TEXT NOT NULL DEFAULT 'english' CHECK (ai_language IN ('english', 'hinglish', 'hindi')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Usage limits: Managed via Service Role in API routes (admin client) to prevent any client spoofing
CREATE POLICY "Allow service role full access on usage_limits"
    ON public.usage_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can read their own usage limit
CREATE POLICY "Users can read own usage limits"
    ON public.usage_limits
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Chat History: Authenticated users can view, insert, and delete their own messages
CREATE POLICY "Users can view own chat history"
    ON public.chat_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
    ON public.chat_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
    ON public.chat_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role full access on chat_history
CREATE POLICY "Allow service role full access on chat_history"
    ON public.chat_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- User Preferences: Authenticated users can view, insert, and update their own preferences
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access on user_preferences
CREATE POLICY "Allow service role full access on user_preferences"
    ON public.user_preferences
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
