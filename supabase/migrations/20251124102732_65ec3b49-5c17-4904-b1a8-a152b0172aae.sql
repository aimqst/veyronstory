-- إصلاح search_path للدوال
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_stock_on_delivery() SET search_path = public;