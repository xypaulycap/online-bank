-- ============================================================================
-- Customer Inquiries / Support Table for Valtier Financial Group
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'urgent'
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public visitors and authenticated users) to submit inquiries
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view their own inquiries
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
CREATE POLICY "Users can view own inquiries" ON public.inquiries
  FOR SELECT USING (auth.uid() = user_id);

-- Allow administrators to view and manage all inquiries
DROP POLICY IF EXISTS "Admins can view and manage all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view and manage all inquiries" ON public.inquiries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
    )
  );

COMMENT ON TABLE public.inquiries IS 'Customer inquiries and support tickets from Help Center and Contact Us pages';
