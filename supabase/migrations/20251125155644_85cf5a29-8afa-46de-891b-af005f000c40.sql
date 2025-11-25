-- إضافة عمود لخصم الإحالة في جدول profiles
ALTER TABLE public.profiles 
ADD COLUMN referral_discount_percentage integer DEFAULT 0;

-- تحديث الـ function لتحديث خصم الإحالة بدلاً من إنشاء كوبون
CREATE OR REPLACE FUNCTION public.apply_referral_discount_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referral_record RECORD;
BEGIN
  -- Only proceed if status changed to delivered
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Check if order has a referral_code
    IF NEW.referral_code IS NOT NULL THEN
      -- Find the referral record
      SELECT r.*, p.id as referrer_user_id
      INTO referral_record
      FROM public.referrals r
      JOIN public.profiles p ON p.referral_code = r.referral_code
      WHERE r.referral_code = NEW.referral_code
        AND r.referred_id = NEW.user_id
        AND r.used = false
      LIMIT 1;

      -- If referral exists and not used yet
      IF FOUND THEN
        -- Mark referral as used
        UPDATE public.referrals
        SET used = true
        WHERE id = referral_record.id;

        -- Give 15% discount to the referrer for their next order
        UPDATE public.profiles
        SET referral_discount_percentage = 15
        WHERE id = referral_record.referrer_user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- حذف الـ trigger القديم إن وُجد
DROP TRIGGER IF EXISTS trigger_create_referral_coupon ON public.orders;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_apply_referral_discount
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.apply_referral_discount_on_delivery();