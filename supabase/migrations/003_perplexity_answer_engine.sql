-- ==============================================================================
-- 003_PERPLEXITY_ANSWER_ENGINE.SQL
-- Schema for GuruAI Answer Engine (Threads, Sources, Citations, Collections, Files)
-- ==============================================================================

-- 1. THREADS TABLE (Every Search or Inquiry is a Thread)
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'search' CHECK (mode IN ('search', 'research', 'academic', 'coding', 'writing', 'youtube')),
    model TEXT NOT NULL DEFAULT 'guru-flash-1.1',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_threads_user_id ON public.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON public.threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_mode ON public.threads(mode);

-- 2. THREAD MESSAGES TABLE (Turn-by-turn question and cited response)
CREATE TABLE IF NOT EXISTS public.thread_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    reasoning TEXT,
    follow_up_questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_thread_messages_thread_id ON public.thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_created_at ON public.thread_messages(created_at ASC);

-- 3. THREAD SOURCES & CITATIONS TABLE (Verified web sources per message)
CREATE TABLE IF NOT EXISTS public.thread_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.thread_messages(id) ON DELETE CASCADE,
    citation_index INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    snippet TEXT,
    favicon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_thread_sources_thread_id ON public.thread_sources(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_sources_message_id ON public.thread_sources(message_id);

-- 4. COLLECTIONS TABLE (User folders like "Class 10 Science", "Python Notes")
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    icon TEXT DEFAULT '📁',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- 5. COLLECTION THREADS LINK TABLE
CREATE TABLE IF NOT EXISTS public.collection_threads (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (collection_id, thread_id)
);

-- 6. UPLOADED FILES TABLE (PDF, DOCX, TXT research attachments)
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Threads Policies
CREATE POLICY "Users can manage own threads"
    ON public.threads FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public threads are viewable by anyone"
    ON public.threads FOR SELECT TO public
    USING (is_public = true);

-- Messages Policies
CREATE POLICY "Users can view and manage own thread messages"
    ON public.thread_messages FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Sources Policies
CREATE POLICY "Users can view sources of accessible threads"
    ON public.thread_sources FOR SELECT TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.threads t
            WHERE t.id = thread_sources.thread_id
            AND (t.user_id = auth.uid() OR t.is_public = true)
        )
    );

CREATE POLICY "Users can insert sources to own threads"
    ON public.thread_sources FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.threads t
            WHERE t.id = thread_sources.thread_id
            AND t.user_id = auth.uid()
        )
    );

-- Collections Policies
CREATE POLICY "Users can manage own collections"
    ON public.collections FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by anyone"
    ON public.collections FOR SELECT TO public
    USING (is_public = true);

-- Uploaded Files Policies
CREATE POLICY "Users can manage own uploaded files"
    ON public.uploaded_files FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
