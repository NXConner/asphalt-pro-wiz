-- Fix function search_path security issue
-- The update_updated_at_column function needs SET search_path for security

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at column. Secured with fixed search_path.';