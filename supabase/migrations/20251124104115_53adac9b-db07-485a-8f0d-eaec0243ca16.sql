-- Update profiles table to use email instead of phone as primary identifier
-- The phone field will still exist but won't be required for signup

ALTER TABLE public.profiles 
ALTER COLUMN phone DROP NOT NULL;

-- Update the trigger function to handle email-based signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign admin role to abdoelhware0@gmail.com
  IF NEW.email = 'abdoelhware0@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Assign user role to all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;