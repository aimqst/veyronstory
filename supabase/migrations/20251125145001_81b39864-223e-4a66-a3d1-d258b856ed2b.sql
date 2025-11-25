-- Add colors and sizes to products table
ALTER TABLE public.products 
ADD COLUMN colors TEXT[] DEFAULT '{}',
ADD COLUMN sizes TEXT[] DEFAULT '{}';

-- Create banners table for promotional offers
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.banners
FOR SELECT
USING (is_active = true);

-- Admins can manage banners
CREATE POLICY "Admins can insert banners"
ON public.banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banners"
ON public.banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banners"
ON public.banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for banners updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();