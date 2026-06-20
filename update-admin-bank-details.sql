-- Run this SQL script in your Supabase SQL Editor to add the new column for user-specific admin bank details
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS admin_bank_details JSONB;
