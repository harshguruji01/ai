-- ==============================================================================
-- HARSHGURUJI AI — PRODUCTION SUPABASE MIGRATION 001
-- Tables: usage_limits, conversations, chat_messages, user_preferences
-- Features: Concurrency-Safe Atomic Rate Limiting, RLS, Storage Bucket Setup
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'aborted')),
    image_url TEXT,
    storage_path TEXT,
    model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at ASC);

-- 3. USAGE LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_key_hash TEXT,
    request_count INT NOT NULL DEFAULT 0 CHECK (request_count >= 0),
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    window_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT chk_usage_identity CHECK (
        (user_id IS NOT NULL AND guest_key_hash IS NULL) OR
        (user_id IS NULL AND guest_key_hash IS NOT NULL)
    )
);

-- Unique indexes ensuring single active limit row per user or per guest key hash
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_usage_user ON public.usage_limits(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_usage_guest ON public.usage_limits(guest_key_hash) WHERE guest_key_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usage_window_expires ON public.usage_limits(window_expires_at);

-- 4. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'cyberpunk')),
    font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    font_family TEXT NOT NULL DEFAULT 'sans' CHECK (font_family IN ('sans', 'serif', 'mono')),
    ai_language TEXT NOT NULL DEFAULT 'english' CHECK (ai_language IN ('english', 'hinglish', 'hindi')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON public.conversations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON public.conversations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on conversations"
    ON public.conversations FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Chat Messages RLS
CREATE POLICY "Users can view own chat messages"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
    ON public.chat_messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
    ON public.chat_messages FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on chat_messages"
    ON public.chat_messages FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Usage Limits RLS
CREATE POLICY "Users can view own usage limits"
    ON public.usage_limits FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on usage_limits"
    ON public.usage_limits FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- User Preferences RLS
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_preferences"
    ON public.user_preferences FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- ATOMIC CONCURRENCY-SAFE RATE LIMITING FUNCTIONS
-- ==============================================================================

-- Atomically reserve 1 generation operation with row-level locking
CREATE OR REPLACE FUNCTION public.reserve_usage_allowance(
    p_user_id UUID,
    p_guest_key_hash TEXT,
    p_max_requests INT,
    p_window_duration_seconds INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INT,
    remaining_allowance INT,
    window_expires_at TIMESTAMPTZ,
    reset_in_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record public.usage_limits%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc', now());
    v_new_expires_at TIMESTAMPTZ;
BEGIN
    -- Validate input constraints
    IF (p_user_id IS NULL AND p_guest_key_hash IS NULL) OR
       (p_user_id IS NOT NULL AND p_guest_key_hash IS NOT NULL) THEN
        RAISE EXCEPTION 'Invalid parameters: Exactly one of p_user_id or p_guest_key_hash must be non-null';
    END IF;

    -- Lock the specific row for update
    IF p_user_id IS NOT NULL THEN
        SELECT * INTO v_record
        FROM public.usage_limits
        WHERE user_id = p_user_id
        FOR UPDATE;
    ELSE
        SELECT * INTO v_record
        FROM public.usage_limits
        WHERE guest_key_hash = p_guest_key_hash
        FOR UPDATE;
    END IF;

    -- Scenario 1: No previous record exists
    IF NOT FOUND THEN
        v_new_expires_at := v_now + (p_window_duration_seconds || ' seconds')::INTERVAL;
        INSERT INTO public.usage_limits (
            user_id,
            guest_key_hash,
            request_count,
            window_started_at,
            window_expires_at,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_guest_key_hash,
            1,
            v_now,
            v_new_expires_at,
            v_now,
            v_now
        );

        RETURN QUERY SELECT
            true AS allowed,
            1 AS current_count,
            GREATEST(0, p_max_requests - 1) AS remaining_allowance,
            v_new_expires_at AS window_expires_at,
            p_window_duration_seconds AS reset_in_seconds;
        RETURN;
    END IF;

    -- Scenario 2: Existing record, but window has expired -> Reset window
    IF v_now >= v_record.window_expires_at THEN
        v_new_expires_at := v_now + (p_window_duration_seconds || ' seconds')::INTERVAL;
        UPDATE public.usage_limits
        SET request_count = 1,
            window_started_at = v_now,
            window_expires_at = v_new_expires_at,
            updated_at = v_now
        WHERE id = v_record.id;

        RETURN QUERY SELECT
            true AS allowed,
            1 AS current_count,
            GREATEST(0, p_max_requests - 1) AS remaining_allowance,
            v_new_expires_at AS window_expires_at,
            p_window_duration_seconds AS reset_in_seconds;
        RETURN;
    END IF;

    -- Scenario 3: Window active, quota exhausted
    IF v_record.request_count >= p_max_requests THEN
        RETURN QUERY SELECT
            false AS allowed,
            v_record.request_count AS current_count,
            0 AS remaining_allowance,
            v_record.window_expires_at AS window_expires_at,
            GREATEST(0, EXTRACT(EPOCH FROM (v_record.window_expires_at - v_now))::INT) AS reset_in_seconds;
        RETURN;
    END IF;

    -- Scenario 4: Window active, allowance available -> Increment count
    UPDATE public.usage_limits
    SET request_count = v_record.request_count + 1,
        updated_at = v_now
    WHERE id = v_record.id;

    RETURN QUERY SELECT
        true AS allowed,
        (v_record.request_count + 1) AS current_count,
        GREATEST(0, p_max_requests - (v_record.request_count + 1)) AS remaining_allowance,
        v_record.window_expires_at AS window_expires_at,
        GREATEST(0, EXTRACT(EPOCH FROM (v_record.window_expires_at - v_now))::INT) AS reset_in_seconds;
    RETURN;
END;
$$;

-- Function to refund reservation if upstream AI provider fails
CREATE OR REPLACE FUNCTION public.refund_usage_allowance(
    p_user_id UUID,
    p_guest_key_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_user_id IS NOT NULL THEN
        UPDATE public.usage_limits
        SET request_count = GREATEST(0, request_count - 1),
            updated_at = timezone('utc', now())
        WHERE user_id = p_user_id;
    ELSIF p_guest_key_hash IS NOT NULL THEN
        UPDATE public.usage_limits
        SET request_count = GREATEST(0, request_count - 1),
            updated_at = timezone('utc', now())
        WHERE guest_key_hash = p_guest_key_hash;
    END IF;
END;
$$;

-- Periodic cleanup function for expired guest records (run via pg_cron or scheduled job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_usage(p_days_old INT DEFAULT 2)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted_count INT;
BEGIN
    DELETE FROM public.usage_limits
    WHERE guest_key_hash IS NOT NULL
      AND window_expires_at < (timezone('utc', now()) - (p_days_old || ' days')::INTERVAL);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$;

-- REVOKE public execution; GRANT exclusively to service_role
REVOKE ALL ON FUNCTION public.reserve_usage_allowance(UUID, TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_usage_allowance(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_expired_guest_usage(INT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_usage_allowance(UUID, TEXT, INT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_usage_allowance(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_guest_usage(INT) TO service_role;

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Private Bucket for AI Generated Images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'generated-images',
    'generated-images',
    false,
    10485760, -- 10MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;

-- Storage RLS Policies
CREATE POLICY "Allow authenticated users to read their own generated images"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow service role full access on generated-images storage"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'generated-images')
WITH CHECK (bucket_id = 'generated-images');
