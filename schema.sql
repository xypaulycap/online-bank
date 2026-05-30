-- ============================================================================
-- Complete Supabase schema for the Valtier Finacial Group project
-- ============================================================================
-- This file is intended to be safe to run on a fresh project and helpful on a
-- partially-configured project. It includes:
-- - core banking tables
-- - KYC, deposits, cards, notifications, and crypto wallets
-- - signup/profile/account automation
-- - RLS policies for user and admin flows used by the app
-- - indexes and backfills for existing auth users
-- ============================================================================

-- ============================================================================
-- 1. Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Core lookup tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.account_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Main tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(150) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  profile_picture TEXT,
  transfer_pin VARCHAR(255),
  transfer_pin_2 VARCHAR(255),
  can_transfer BOOLEAN NOT NULL DEFAULT TRUE,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type_id INTEGER NOT NULL REFERENCES public.account_types(id),
  account_number VARCHAR(50) NOT NULL UNIQUE,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  transaction_limit NUMERIC(15, 2) NOT NULL DEFAULT 500000.00 CHECK (transaction_limit >= 0),
  daily_limit NUMERIC(15, 2) NOT NULL DEFAULT 10000.00 CHECK (daily_limit >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  category_id INTEGER REFERENCES public.transaction_categories(id) ON DELETE SET NULL,
  recipient_account_id INTEGER REFERENCES public.accounts(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'approved',
  verification_step INTEGER NOT NULL DEFAULT 0 CHECK (verification_step >= 0),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Feature tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ssn VARCHAR(11),
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  wallet_address TEXT NOT NULL,
  logo_url TEXT,
  network VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  crypto_wallet_id INTEGER NOT NULL REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  crypto_symbol VARCHAR(10) NOT NULL,
  transaction_hash TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.card_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  card_type VARCHAR(20) NOT NULL,
  card_tier VARCHAR(20),
  card_number VARCHAR(19),
  expiry_month VARCHAR(2),
  expiry_year VARCHAR(4),
  cvv VARCHAR(3),
  card_holder_name TEXT,
  daily_limit NUMERIC(15, 2) CHECK (daily_limit IS NULL OR daily_limit >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ
);

-- ============================================================================
-- 5. Compatibility column additions for partially-existing databases
-- ============================================================================

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS transfer_pin VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS transfer_pin_2 VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS can_transfer BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS transaction_limit NUMERIC(15, 2) DEFAULT 500000.00;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS daily_limit NUMERIC(15, 2) DEFAULT 10000.00;

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS verification_step INTEGER DEFAULT 0;

UPDATE public.user_profiles
SET can_transfer = TRUE
WHERE can_transfer IS NULL;

UPDATE public.user_profiles
SET currency = 'USD'
WHERE currency IS NULL OR currency = '';

UPDATE public.accounts
SET transaction_limit = 500000.00
WHERE transaction_limit IS NULL;

UPDATE public.accounts
SET daily_limit = 10000.00
WHERE daily_limit IS NULL;

UPDATE public.transactions
SET status = 'approved'
WHERE status IS NULL OR status = '';

UPDATE public.transactions
SET verification_step = 0
WHERE verification_step IS NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN can_transfer SET DEFAULT TRUE,
  ALTER COLUMN can_transfer SET NOT NULL,
  ALTER COLUMN currency SET DEFAULT 'USD',
  ALTER COLUMN currency SET NOT NULL;

ALTER TABLE public.accounts
  ALTER COLUMN transaction_limit SET DEFAULT 500000.00,
  ALTER COLUMN transaction_limit SET NOT NULL,
  ALTER COLUMN daily_limit SET DEFAULT 10000.00,
  ALTER COLUMN daily_limit SET NOT NULL;

ALTER TABLE public.transactions
  ALTER COLUMN status SET DEFAULT 'approved',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN verification_step SET DEFAULT 0,
  ALTER COLUMN verification_step SET NOT NULL;

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_currency_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_currency_check
  CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD'));

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_transaction_type_check
  CHECK (
    transaction_type IN (
      'deposit',
      'withdrawal',
      'transfer',
      'payment',
      'local_transfer',
      'wire_transfer',
      'international_transfer'
    )
  );

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE public.kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_status_check;
ALTER TABLE public.kyc_submissions
  ADD CONSTRAINT kyc_submissions_status_check
  CHECK (status IN ('pending', 'under_review', 'approved', 'rejected'));

ALTER TABLE public.deposit_requests DROP CONSTRAINT IF EXISTS deposit_requests_status_check;
ALTER TABLE public.deposit_requests
  ADD CONSTRAINT deposit_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE public.card_requests DROP CONSTRAINT IF EXISTS card_requests_card_type_check;
ALTER TABLE public.card_requests
  ADD CONSTRAINT card_requests_card_type_check
  CHECK (card_type IN ('virtual', 'physical'));

ALTER TABLE public.card_requests DROP CONSTRAINT IF EXISTS card_requests_card_tier_check;
ALTER TABLE public.card_requests
  ADD CONSTRAINT card_requests_card_tier_check
  CHECK (card_tier IS NULL OR card_tier IN ('standard', 'gold', 'platinum'));

ALTER TABLE public.card_requests DROP CONSTRAINT IF EXISTS card_requests_status_check;
ALTER TABLE public.card_requests
  ADD CONSTRAINT card_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'issued'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'accounts'
      AND constraint_name = 'accounts_user_id_user_profiles_fkey'
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT accounts_user_id_user_profiles_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.user_profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 6. Default seed data
-- ============================================================================

INSERT INTO public.account_types (name, description) VALUES
  ('Checking', 'Standard checking account'),
  ('Savings', 'Savings account with interest'),
  ('Business', 'Business account')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.transaction_categories (name, description) VALUES
  ('Food & Dining', 'Restaurants, groceries, food delivery'),
  ('Transportation', 'Gas, public transport, rideshare'),
  ('Shopping', 'Retail purchases, online shopping'),
  ('Bills & Utilities', 'Rent, utilities, subscriptions'),
  ('Entertainment', 'Movies, games, events'),
  ('Healthcare', 'Medical expenses, pharmacy'),
  ('Income', 'Salary, freelance, refunds')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 7. Helper functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = user_id
      AND is_admin = TRUE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.generate_unique_account_number(account_prefix TEXT DEFAULT 'SAV')
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_number VARCHAR(50);
  max_attempts INTEGER := 25;
  attempt_count INTEGER := 0;
BEGIN
  LOOP
    generated_number := UPPER(COALESCE(NULLIF(account_prefix, ''), 'ACC')) || '-' ||
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD((EXTRACT(EPOCH FROM clock_timestamp())::BIGINT % 1000000)::TEXT, 6, '0') || '-' ||
      LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    IF NOT EXISTS (
      SELECT 1
      FROM public.accounts
      WHERE account_number = generated_number
    ) THEN
      RETURN generated_number;
    END IF;

    attempt_count := attempt_count + 1;

    IF attempt_count >= max_attempts THEN
      RETURN UPPER(COALESCE(NULLIF(account_prefix, ''), 'ACC')) || '-' ||
        REPLACE(SUBSTRING(uuid_generate_v4()::TEXT, 1, 8), '-', '') || '-' ||
        TO_CHAR(EXTRACT(EPOCH FROM clock_timestamp())::BIGINT % 100000, 'FM00000');
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_user_profile_from_auth(
  p_user_id UUID,
  p_email TEXT,
  p_raw_user_meta JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    first_name,
    last_name,
    can_transfer,
    currency,
    is_admin
  )
  VALUES (
    p_user_id,
    p_email,
    NULLIF(TRIM(COALESCE(p_raw_user_meta->>'username', '')), ''),
    NULLIF(TRIM(COALESCE(p_raw_user_meta->>'first_name', '')), ''),
    NULLIF(TRIM(COALESCE(p_raw_user_meta->>'last_name', '')), ''),
    TRUE,
    'USD',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.user_profiles.username),
    first_name = COALESCE(EXCLUDED.first_name, public.user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.user_profiles.last_name),
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_default_account_for_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  savings_account_type_id INTEGER;
BEGIN
  SELECT id
  INTO savings_account_type_id
  FROM public.account_types
  WHERE name = 'Savings'
  LIMIT 1;

  IF savings_account_type_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.accounts
    WHERE user_id = p_user_id
  ) THEN
    INSERT INTO public.accounts (
      user_id,
      account_type_id,
      account_number,
      balance,
      transaction_limit,
      daily_limit,
      is_active
    )
    VALUES (
      p_user_id,
      savings_account_type_id,
      public.generate_unique_account_number('SAV'),
      0.00,
      500000.00,
      10000.00,
      TRUE
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.upsert_user_profile_from_auth(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::JSONB)
  );

  PERFORM public.ensure_default_account_for_user(NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.upsert_user_profile_from_auth(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::JSONB)
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_auth_user_updated failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_user_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Allow system-triggered syncs and allow admins to manage protected fields.
  IF auth.uid() IS NULL OR public.is_user_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_admin := FALSE;
    NEW.transfer_pin := NULL;
    NEW.transfer_pin_2 := NULL;
    NEW.can_transfer := TRUE;
    NEW.currency := 'USD';
    RETURN NEW;
  END IF;

  NEW.email := OLD.email;
  NEW.is_admin := OLD.is_admin;
  NEW.transfer_pin := OLD.transfer_pin;
  NEW.transfer_pin_2 := OLD.transfer_pin_2;
  NEW.can_transfer := OLD.can_transfer;
  NEW.currency := OLD.currency;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 8. Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS protect_user_profile_privileged_fields ON public.user_profiles;
CREATE TRIGGER protect_user_profile_privileged_fields
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_profile_privileged_fields();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_kyc_submissions_updated_at ON public.kyc_submissions;
CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_wallets_updated_at ON public.crypto_wallets;
CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON public.crypto_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_deposit_requests_updated_at ON public.deposit_requests;
CREATE TRIGGER update_deposit_requests_updated_at
  BEFORE UPDATE ON public.deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_requests_updated_at ON public.card_requests;
CREATE TRIGGER update_card_requests_updated_at
  BEFORE UPDATE ON public.card_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated_profile_sync ON auth.users;
CREATE TRIGGER on_auth_user_updated_profile_sync
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_updated();

-- ============================================================================
-- 9. Backfill existing auth users
-- ============================================================================

DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
  LOOP
    PERFORM public.upsert_user_profile_from_auth(
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data, '{}'::JSONB)
    );

    PERFORM public.ensure_default_account_for_user(auth_user.id);
  END LOOP;
END $$;

-- ============================================================================
-- 10. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type_id ON public.accounts(account_type_id);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON public.accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at_desc ON public.accounts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_account_id ON public.transactions(recipient_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON public.transactions(status, transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp_desc ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_timestamp_desc ON public.transactions(account_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created_at ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at_desc ON public.kyc_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crypto_wallets_active_display_order ON public.crypto_wallets(is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_account_id ON public.deposit_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at_desc ON public.deposit_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON public.card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_account_id ON public.card_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_status ON public.card_requests(status);
CREATE INDEX IF NOT EXISTS idx_card_requests_created_at_desc ON public.card_requests(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_submissions_one_active_per_user
  ON public.kyc_submissions(user_id)
  WHERE status IN ('pending', 'under_review', 'approved');

-- ============================================================================
-- 11. Enable Row Level Security
-- ============================================================================

ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. RLS policies
-- ============================================================================

-- Lookup tables
DROP POLICY IF EXISTS "Authenticated users can view account types" ON public.account_types;
CREATE POLICY "Authenticated users can view account types"
  ON public.account_types
  FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can view transaction categories" ON public.transaction_categories;
CREATE POLICY "Authenticated users can view transaction categories"
  ON public.transaction_categories
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- User profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all user profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all user profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete user profiles"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

-- Accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
CREATE POLICY "Users can insert their own accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
CREATE POLICY "Users can update their own accounts"
  ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
CREATE POLICY "Admins can view all accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert accounts" ON public.accounts;
CREATE POLICY "Admins can insert accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all accounts" ON public.accounts;
CREATE POLICY "Admins can update all accounts"
  ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete accounts" ON public.accounts;
CREATE POLICY "Admins can delete accounts"
  ON public.accounts
  FOR DELETE
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

-- Transactions
DROP POLICY IF EXISTS "Users can view transactions for their accounts" ON public.transactions;
CREATE POLICY "Users can view transactions for their accounts"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.accounts
      WHERE public.accounts.id = public.transactions.account_id
        AND public.accounts.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.accounts
      WHERE public.accounts.id = public.transactions.recipient_account_id
        AND public.accounts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert transactions for their accounts" ON public.transactions;
CREATE POLICY "Users can insert transactions for their accounts"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.accounts
      WHERE public.accounts.id = public.transactions.account_id
        AND public.accounts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
CREATE POLICY "Admins can insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
CREATE POLICY "Admins can update all transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
CREATE POLICY "Admins can delete transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

-- Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
CREATE POLICY "Admins can update notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

-- KYC submissions
DROP POLICY IF EXISTS "Users can view their own KYC submissions" ON public.kyc_submissions;
CREATE POLICY "Users can view their own KYC submissions"
  ON public.kyc_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create KYC submissions" ON public.kyc_submissions;
CREATE POLICY "Users can create KYC submissions"
  ON public.kyc_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pending submissions" ON public.kyc_submissions;
CREATE POLICY "Users can update their own pending submissions"
  ON public.kyc_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all KYC submissions" ON public.kyc_submissions;
CREATE POLICY "Admins can view all KYC submissions"
  ON public.kyc_submissions
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all KYC submissions" ON public.kyc_submissions;
CREATE POLICY "Admins can update all KYC submissions"
  ON public.kyc_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- Crypto wallets
DROP POLICY IF EXISTS "Anyone can view active crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Anyone can view active crypto wallets"
  ON public.crypto_wallets
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can view all crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Admins can view all crypto wallets"
  ON public.crypto_wallets
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Admins can insert crypto wallets"
  ON public.crypto_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Admins can update crypto wallets"
  ON public.crypto_wallets
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete crypto wallets" ON public.crypto_wallets;
CREATE POLICY "Admins can delete crypto wallets"
  ON public.crypto_wallets
  FOR DELETE
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

-- Deposit requests
DROP POLICY IF EXISTS "Users can view their own deposit requests" ON public.deposit_requests;
CREATE POLICY "Users can view their own deposit requests"
  ON public.deposit_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create deposit requests" ON public.deposit_requests;
CREATE POLICY "Users can create deposit requests"
  ON public.deposit_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.deposit_requests;
CREATE POLICY "Users can update their own pending requests"
  ON public.deposit_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all deposit requests" ON public.deposit_requests;
CREATE POLICY "Admins can view all deposit requests"
  ON public.deposit_requests
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update deposit requests" ON public.deposit_requests;
CREATE POLICY "Admins can update deposit requests"
  ON public.deposit_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- Card requests
DROP POLICY IF EXISTS "Users can view their own card requests" ON public.card_requests;
CREATE POLICY "Users can view their own card requests"
  ON public.card_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create card requests" ON public.card_requests;
CREATE POLICY "Users can create card requests"
  ON public.card_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pending requests" ON public.card_requests;
CREATE POLICY "Users can update their own pending requests"
  ON public.card_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all card requests" ON public.card_requests;
CREATE POLICY "Admins can view all card requests"
  ON public.card_requests
  FOR SELECT
  TO authenticated
  USING (public.is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all card requests" ON public.card_requests;
CREATE POLICY "Admins can update all card requests"
  ON public.card_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- ============================================================================
-- 13. Helpful column comments
-- ============================================================================

COMMENT ON COLUMN public.user_profiles.profile_picture IS 'Image URL for the user profile picture';
COMMENT ON COLUMN public.user_profiles.transfer_pin IS 'Current app stores an encoded transfer PIN string';
COMMENT ON COLUMN public.user_profiles.transfer_pin_2 IS 'Optional second encoded transfer PIN string';
COMMENT ON COLUMN public.accounts.transaction_limit IS 'Per-transaction transfer limit used by admin controls';
COMMENT ON COLUMN public.accounts.daily_limit IS 'Daily transfer limit used by admin controls';
COMMENT ON COLUMN public.transactions.verification_step IS 'Multi-step transfer verification progress';

-- ============================================================================
-- End of schema
-- ============================================================================
