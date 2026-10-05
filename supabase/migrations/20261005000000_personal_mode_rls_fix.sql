-- ==============================================================================
-- MoneyFlow Database Migration: Personal Mode Access & RLS Fix (Complete)
-- Run this in your Supabase SQL Editor to allow your personal MoneyFlow app
-- to insert, view, update, and delete transactions without authentication errors.
-- ==============================================================================

-- 1. DROP ALL EXISTING RLS POLICIES FIRST
-- (PostgreSQL prevents altering column types when policies depend on them)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('profiles', 'accounts', 'categories', 'transactions', 'transfers')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Explicitly ensure all default policies are dropped
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;

DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can insert own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can update own transfers" ON public.transfers;
DROP POLICY IF EXISTS "Users can delete own transfers" ON public.transfers;

-- 2. DISABLE ROW LEVEL SECURITY (RLS) FOR PERSONAL STANDALONE MODE
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transfers DISABLE ROW LEVEL SECURITY;

-- 3. DROP CONSTRAINTS THAT REQUIRE SUPABASE AUTH SESSIONS (auth.users)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.accounts DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
ALTER TABLE IF EXISTS public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE IF EXISTS public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE IF EXISTS public.transfers DROP CONSTRAINT IF EXISTS transfers_user_id_fkey;

-- 4. DROP STRICT FOREIGN KEY & CHECK CONSTRAINTS
ALTER TABLE IF EXISTS public.transactions DROP CONSTRAINT IF EXISTS transactions_account_id_fkey;
ALTER TABLE IF EXISTS public.transactions DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;
ALTER TABLE IF EXISTS public.transfers DROP CONSTRAINT IF EXISTS transfers_from_account_id_fkey;
ALTER TABLE IF EXISTS public.transfers DROP CONSTRAINT IF EXISTS transfers_to_account_id_fkey;
ALTER TABLE IF EXISTS public.transfers DROP CONSTRAINT IF EXISTS chk_different_accounts;

-- 5. DROP DEFAULT UUID GENERATORS ON PRIMARY KEYS
ALTER TABLE IF EXISTS public.accounts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.transfers ALTER COLUMN id DROP DEFAULT;

-- 6. CONVERT ALL ID & FOREIGN KEY COLUMNS TO TEXT
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE IF EXISTS public.accounts ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE IF EXISTS public.accounts ALTER COLUMN user_id TYPE TEXT USING user_id::text;

ALTER TABLE IF EXISTS public.categories ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN user_id TYPE TEXT USING user_id::text;

ALTER TABLE IF EXISTS public.transactions ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN account_id TYPE TEXT USING account_id::text;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN category_id TYPE TEXT USING category_id::text;

ALTER TABLE IF EXISTS public.transfers ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE IF EXISTS public.transfers ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE IF EXISTS public.transfers ALTER COLUMN from_account_id TYPE TEXT USING from_account_id::text;
ALTER TABLE IF EXISTS public.transfers ALTER COLUMN to_account_id TYPE TEXT USING to_account_id::text;

-- 7. RE-ADD TRANSFERS CHECK CONSTRAINT FOR TEXT TYPE
ALTER TABLE IF EXISTS public.transfers ADD CONSTRAINT chk_different_accounts CHECK (from_account_id <> to_account_id);

-- 8. MAKE user_id OPTIONAL
ALTER TABLE IF EXISTS public.accounts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.transfers ALTER COLUMN user_id DROP NOT NULL;

-- 9. ENSURE DEFAULT ACCOUNTS EXIST
INSERT INTO public.accounts (id, name, type, opening_balance, icon, color)
VALUES
  ('acc-cash', 'Cash', 'CASH', 0.00, 'Banknote', '#16A34A'),
  ('acc-bank', 'Bank Account', 'BANK', 0.00, 'Building2', '#2563EB'),
  ('acc-upi', 'UPI', 'UPI', 0.00, 'Smartphone', '#7C3AED')
ON CONFLICT (id) DO NOTHING;

-- 10. ENSURE DEFAULT CATEGORIES EXIST
INSERT INTO public.categories (id, name, type, icon, color, is_default)
VALUES
  ('cat-salary', 'Salary', 'INCOME', 'Briefcase', '#16A34A', true),
  ('cat-freelance', 'Freelance', 'INCOME', 'Laptop', '#10B981', true),
  ('cat-gift', 'Gift', 'INCOME', 'Gift', '#0D9488', true),
  ('cat-cashback', 'Cashback', 'INCOME', 'Sparkles', '#2563EB', true),
  ('cat-refund', 'Refund', 'INCOME', 'RotateCcw', '#0284C7', true),
  ('cat-other-income', 'Other Income', 'INCOME', 'PlusCircle', '#6366F1', true),
  ('cat-food', 'Food', 'EXPENSE', 'Utensils', '#EA580C', true),
  ('cat-shopping', 'Shopping', 'EXPENSE', 'ShoppingBag', '#DB2777', true),
  ('cat-travel', 'Travel', 'EXPENSE', 'Navigation', '#0284C7', true),
  ('cat-fuel', 'Fuel', 'EXPENSE', 'Fuel', '#D97706', true),
  ('cat-bills', 'Bills', 'EXPENSE', 'Receipt', '#DC2626', true),
  ('cat-entertainment', 'Entertainment', 'EXPENSE', 'Film', '#9333EA', true),
  ('cat-health', 'Health', 'EXPENSE', 'HeartPulse', '#E11D48', true),
  ('cat-subscriptions', 'Subscriptions', 'EXPENSE', 'CalendarClock', '#7C3AED', true),
  ('cat-other-expense', 'Other', 'EXPENSE', 'HelpCircle', '#6B7280', true)
ON CONFLICT (id) DO NOTHING;
