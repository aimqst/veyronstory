-- Create AI configuration table for personality and custom data
CREATE TABLE IF NOT EXISTS public.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'أحمد',
  age INTEGER DEFAULT 28,
  personality TEXT DEFAULT 'ودود ومحترف',
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI custom data table for admin to add custom information
CREATE TABLE IF NOT EXISTS public.ai_custom_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default AI personality
INSERT INTO public.ai_config (name, age, personality, additional_info)
VALUES (
  'أحمد',
  28,
  'ودود ومحترف ومتحمس لمساعدة العملاء',
  'خبرة في مجال الموضة والملابس الرياضية، يحب مساعدة العملاء في اختيار المنتجات المناسبة'
);

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_custom_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_config
CREATE POLICY "Anyone can view AI config"
  ON public.ai_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update AI config"
  ON public.ai_config
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ai_custom_data
CREATE POLICY "Anyone can view active custom data"
  ON public.ai_custom_data
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage custom data"
  ON public.ai_custom_data
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_ai_config_updated_at
  BEFORE UPDATE ON public.ai_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_custom_data_updated_at
  BEFORE UPDATE ON public.ai_custom_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();