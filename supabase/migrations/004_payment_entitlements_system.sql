-- ==============================================================================
-- HARSHGURUJI AI — PRODUCTION SUPABASE MIGRATION 004
-- Entitlement-Based Premium Access & Secure Payment Infrastructure
-- Tables: payment_orders, payment_transactions, user_entitlements, 
--         payment_webhook_events, payment_audit_logs
-- ==============================================================================

-- 1. PAYMENT ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    gateway_order_id TEXT UNIQUE NOT NULL,
    plan_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_email ON public.payment_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_orders_gateway_order_id ON public.payment_orders(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);

-- 2. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.payment_orders(id) ON DELETE CASCADE,
    gateway_payment_id TEXT UNIQUE NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('captured', 'paid', 'failed', 'refunded', 'pending')),
    payment_method TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_payment_id ON public.payment_transactions(gateway_payment_id);

-- 3. USER ENTITLEMENTS TABLE (Model Permissions Authority)
CREATE TABLE IF NOT EXISTS public.user_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    allowed_models JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    expires_at TIMESTAMPTZ,
    source_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_entitlement_plan ON public.user_entitlements(user_email, plan_id);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_id ON public.user_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_status ON public.user_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_user_entitlements_expires_at ON public.user_entitlements(expires_at);

-- 4. PAYMENT WEBHOOK EVENTS TABLE (Idempotency Guard)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
    processed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_gateway_id ON public.payment_webhook_events(gateway_event_id);

-- 5. PAYMENT AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    payment_id TEXT,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_user_id ON public.payment_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_action ON public.payment_audit_logs(action);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;

-- payment_orders RLS: authenticated users can only view their own orders
CREATE POLICY "Users can view own payment orders"
    ON public.payment_orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email);

-- user_entitlements RLS: users can only view their own entitlements
CREATE POLICY "Users can view own entitlements"
    ON public.user_entitlements FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email);

-- payment_transactions RLS: users can view transactions for their orders
CREATE POLICY "Users can view own transactions"
    ON public.payment_transactions FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM public.payment_orders 
            WHERE user_id = auth.uid() OR user_email = auth.jwt() ->> 'email'
        )
    );
