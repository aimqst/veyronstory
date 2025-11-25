-- إضافة عمود لحفظ كود الإحالة المُستخدم عند التسجيل
ALTER TABLE public.profiles 
ADD COLUMN used_referral_code text;

-- تحديث الـ trigger ليعمل بشكل صحيح
DROP TRIGGER IF EXISTS trigger_apply_referral_discount ON public.orders;

-- تحديث الـ function لتطبيق الخصم بشكل صحيح
CREATE OR REPLACE FUNCTION public.apply_referral_discount_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_user_id uuid;
BEGIN
  -- Only proceed if status changed to delivered
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Check if order has a referral_code
    IF NEW.referral_code IS NOT NULL THEN
      -- Find the referrer by their referral code
      SELECT id INTO referrer_user_id
      FROM public.profiles
      WHERE referral_code = NEW.referral_code
      LIMIT 1;

      IF referrer_user_id IS NOT NULL THEN
        -- Check if there's an unused referral for this order's user
        UPDATE public.referrals
        SET used = true
        WHERE referral_code = NEW.referral_code
          AND referred_id = NEW.user_id
          AND used = false;

        -- Give 15% discount to the referrer for their next order
        UPDATE public.profiles
        SET referral_discount_percentage = 15
        WHERE id = referrer_user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_apply_referral_discount
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.apply_referral_discount_on_delivery();