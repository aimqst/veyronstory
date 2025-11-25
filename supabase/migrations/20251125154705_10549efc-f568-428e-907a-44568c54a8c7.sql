-- Function to create referral coupon when order is delivered
CREATE OR REPLACE FUNCTION public.create_referral_coupon_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  new_coupon_code TEXT;
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

        -- Generate coupon code
        new_coupon_code := 'REF' || upper(substring(md5(random()::text) from 1 for 6));

        -- Create 15% discount coupon for the referrer
        INSERT INTO public.discount_coupons (
          code,
          discount_percentage,
          max_uses,
          current_uses,
          is_active,
          created_by
        ) VALUES (
          new_coupon_code,
          15,
          1,
          0,
          true,
          referral_record.referrer_id
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_create_referral_coupon ON public.orders;
CREATE TRIGGER trigger_create_referral_coupon
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_coupon_on_delivery();