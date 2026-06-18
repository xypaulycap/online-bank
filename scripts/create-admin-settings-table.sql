CREATE TABLE IF NOT EXISTS public.admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default admin bank details if not exists
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES (
    'bank_details', 
    '{"account_number": "704 337 8748", "bank_name": "OPay Digital Service Limited (OPay)", "account_name": "EWEAN PATRICK AIYOHUYIN", "routing_number": ""}'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;

-- Create policy for public read access (if using RLS)
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to settings" ON public.admin_settings;
CREATE POLICY "Allow public read access to settings" 
ON public.admin_settings FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update settings (or restrict to admin)
DROP POLICY IF EXISTS "Allow admins to modify settings" ON public.admin_settings;
CREATE POLICY "Allow admins to modify settings" 
ON public.admin_settings FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
);
