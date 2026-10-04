-- ==============================================================================
-- MoneyFlow Database Migration: V1 Initial Schema
-- Personal Money Tracker (Android + Desktop + Widget)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    currency TEXT DEFAULT 'INR' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACCOUNTS (MONEY LOCATIONS)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CASH', 'BANK', 'UPI', 'WALLET', 'CREDIT_CARD', 'OTHER')),
    currency TEXT DEFAULT 'INR' NOT NULL,
    opening_balance NUMERIC(14,2) DEFAULT 0.00 NOT NULL,
    icon TEXT,
    color TEXT,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'BOTH')),
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 5. TRANSACTIONS (CREDIT / DEBIT)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    source_or_merchant TEXT,
    note TEXT,
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ,
    client_created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    sync_version BIGINT DEFAULT 1 NOT NULL
);

-- 6. TRANSFERS (MOVE MONEY)
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    to_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    note TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ,
    sync_version BIGINT DEFAULT 1 NOT NULL,
    CONSTRAINT chk_different_accounts CHECK (from_account_id <> to_account_id)
);

-- 7. PERFORMANCE & SYNC INDEXES
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_updated_at ON public.accounts(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_updated_at ON public.categories(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_account_date ON public.transactions(user_id, account_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON public.transactions(user_id, type, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(user_id, category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_updated_at ON public.transactions(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON public.transfers(user_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON public.transfers(user_id, from_account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON public.transfers(user_id, to_account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transfers_updated_at ON public.transfers(user_id, updated_at DESC);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Accounts Policies
CREATE POLICY "Users can view own accounts"
    ON public.accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
    ON public.accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
    ON public.accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view own categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Transfers Policies
CREATE POLICY "Users can view own transfers"
    ON public.transfers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transfers"
    ON public.transfers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transfers"
    ON public.transfers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transfers"
    ON public.transfers FOR DELETE
    USING (auth.uid() = user_id);

-- 9. AUTOMATIC USER INITIALIZATION (Trigger for Default Data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    cash_acc_id UUID;
    bank_acc_id UUID;
    upi_acc_id UUID;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (id, full_name, email, currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'MoneyFlow User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'currency', 'INR')
    );

    -- Seed Default Income Categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (NEW.id, 'Salary', 'INCOME', 'Briefcase', '#16A34A', true),
    (NEW.id, 'Freelance', 'INCOME', 'Laptop', '#10B981', true),
    (NEW.id, 'Business', 'INCOME', 'TrendingUp', '#059669', true),
    (NEW.id, 'Gift', 'INCOME', 'Gift', '#0D9488', true),
    (NEW.id, 'Refund', 'INCOME', 'RotateCcw', '#0284C7', true),
    (NEW.id, 'Cashback', 'INCOME', 'Sparkles', '#2563EB', true),
    (NEW.id, 'Interest', 'INCOME', 'Percent', '#4F46E5', true),
    (NEW.id, 'Other Income', 'INCOME', 'PlusCircle', '#6366F1', true);

    -- Seed Default Expense Categories
    INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
    (NEW.id, 'Food', 'EXPENSE', 'Utensils', '#EA580C', true),
    (NEW.id, 'Shopping', 'EXPENSE', 'ShoppingBag', '#DB2777', true),
    (NEW.id, 'Travel', 'EXPENSE', 'Navigation', '#0284C7', true),
    (NEW.id, 'Fuel', 'EXPENSE', 'Fuel', '#D97706', true),
    (NEW.id, 'Bills', 'EXPENSE', 'Receipt', '#DC2626', true),
    (NEW.id, 'Entertainment', 'EXPENSE', 'Film', '#9333EA', true),
    (NEW.id, 'Health', 'EXPENSE', 'HeartPulse', '#E11D48', true),
    (NEW.id, 'Subscriptions', 'EXPENSE', 'CalendarClock', '#7C3AED', true),
    (NEW.id, 'Education', 'EXPENSE', 'GraduationCap', '#4F46E5', true),
    (NEW.id, 'Home', 'EXPENSE', 'Home', '#64748B', true),
    (NEW.id, 'Personal', 'EXPENSE', 'User', '#475569', true),
    (NEW.id, 'Business Spending', 'EXPENSE', 'Building', '#334155', true),
    (NEW.id, 'Other Expense', 'EXPENSE', 'HelpCircle', '#6B7280', true);

    -- Seed Default Money Locations (Accounts)
    INSERT INTO public.accounts (user_id, name, type, opening_balance, icon, color) VALUES
    (NEW.id, 'Cash', 'CASH', 0.00, 'Banknote', '#16A34A'),
    (NEW.id, 'HDFC Bank', 'BANK', 0.00, 'Building2', '#2563EB'),
    (NEW.id, 'UPI', 'UPI', 0.00, 'Smartphone', '#7C3AED');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. REALTIME CONFIGURATION
-- Add tables to realtime publication if supabase_realtime exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transfers;
    END IF;
END $$;
