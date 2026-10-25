-- ==============================================================================
-- GURUAI WORKSPACE MIGRATION 002: SAVED PROMPTS & LIBRARY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.saved_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Custom' CHECK (category IN ('Coding', 'Writing', 'Learning', 'Business', 'Custom')),
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON public.saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_category ON public.saved_prompts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_updated_at ON public.saved_prompts(updated_at DESC);

-- Enable RLS
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved prompts"
    ON public.saved_prompts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved prompts"
    ON public.saved_prompts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved prompts"
    ON public.saved_prompts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved prompts"
    ON public.saved_prompts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on saved_prompts"
    ON public.saved_prompts FOR ALL
    TO service_role USING (true) WITH CHECK (true);
