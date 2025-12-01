-- Create site_settings table for customizable site content
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  is_draft boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published settings
CREATE POLICY "Anyone can view published settings"
ON public.site_settings
FOR SELECT
USING (is_draft = false);

-- Insert default settings
INSERT INTO public.site_settings (key, value, is_draft) VALUES
('brand_info', '{"name": "فيرون", "logo_url": "/src/assets/veyron-logo.png"}'::jsonb, false),
('colors', '{"primary": "262.1 83.3% 57.8%", "secondary": "220 14.3% 95.9%", "accent": "220 14.3% 95.9%", "background": "0 0% 100%", "foreground": "222.2 84% 4.9%"}'::jsonb, false),
('home_texts', '{"hero_title": "مرحباً بك في فيرون", "hero_description": "اكتشف منتجاتنا الفريدة"}'::jsonb, false),
('contact_info', '{"phone": "+201234567890", "whatsapp": "+201234567890", "facebook": "", "instagram": "", "twitter": ""}'::jsonb, false);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();