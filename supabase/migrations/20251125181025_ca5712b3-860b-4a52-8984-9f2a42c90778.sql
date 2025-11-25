-- Create trigger to automatically assign referral code when profile is created
CREATE TRIGGER trigger_assign_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_referral_code();

-- Update existing profiles that don't have a referral code
UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;