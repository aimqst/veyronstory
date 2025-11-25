-- Create ratings table
CREATE TABLE public.product_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Create likes table
CREATE TABLE public.product_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Create comments table
CREATE TABLE public.product_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.product_comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Anyone can view ratings"
ON public.product_ratings FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings"
ON public.product_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.product_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.product_ratings FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for likes
CREATE POLICY "Anyone can view likes"
ON public.product_likes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes"
ON public.product_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.product_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Anyone can view comments"
ON public.product_comments FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.product_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.product_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.product_comments FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.product_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.product_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();