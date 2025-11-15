-- SECURE MIGRATION: re-run without spatial_ref_sys change (requires owner)

-- 1) Mapmeasurements RLS (user-owned via jobs)
ALTER TABLE "Mapmeasurements" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public mapmeasurements are viewable by everyone." ON "Mapmeasurements";
DROP POLICY IF EXISTS "Users can insert their own mapmeasurements." ON "Mapmeasurements";
DROP POLICY IF EXISTS "mapmeasurements_select_user" ON "Mapmeasurements";
DROP POLICY IF EXISTS "mapmeasurements_insert_user" ON "Mapmeasurements";
DROP POLICY IF EXISTS "mapmeasurements_update_user" ON "Mapmeasurements";
DROP POLICY IF EXISTS "mapmeasurements_delete_user" ON "Mapmeasurements";

CREATE POLICY "mapmeasurements_select_user" ON "Mapmeasurements"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = "Mapmeasurements".job_id
      AND j.user_id = auth.uid()
  )
);

CREATE POLICY "mapmeasurements_insert_user" ON "Mapmeasurements"
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = "Mapmeasurements".job_id
      AND j.user_id = auth.uid()
  )
);

CREATE POLICY "mapmeasurements_update_user" ON "Mapmeasurements"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = "Mapmeasurements".job_id
      AND j.user_id = auth.uid()
  )
);

CREATE POLICY "mapmeasurements_delete_user" ON "Mapmeasurements"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = "Mapmeasurements".job_id
      AND j.user_id = auth.uid()
  )
);

-- 2) ai_site_analysis demo-user bypass
ALTER TABLE ai_site_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_site_analysis ALTER COLUMN user_id SET DEFAULT auth.uid()::text;
DROP POLICY IF EXISTS "Users can view own analyses" ON ai_site_analysis;
DROP POLICY IF EXISTS "Users can insert own analyses" ON ai_site_analysis;
DROP POLICY IF EXISTS "Users can update own analyses" ON ai_site_analysis;
DROP POLICY IF EXISTS "Users can delete own analyses" ON ai_site_analysis;
DROP POLICY IF EXISTS "ai_site_analysis_select" ON ai_site_analysis;
DROP POLICY IF EXISTS "ai_site_analysis_insert" ON ai_site_analysis;
DROP POLICY IF EXISTS "ai_site_analysis_update" ON ai_site_analysis;
DROP POLICY IF EXISTS "ai_site_analysis_delete" ON ai_site_analysis;

CREATE POLICY "ai_site_analysis_select" ON ai_site_analysis
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "ai_site_analysis_insert" ON ai_site_analysis
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()::text
);

CREATE POLICY "ai_site_analysis_update" ON ai_site_analysis
FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "ai_site_analysis_delete" ON ai_site_analysis
FOR DELETE USING (user_id = auth.uid()::text);

-- 3) Alerts ownership validation + audit
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
DROP POLICY IF EXISTS "System can create alerts" ON alerts;
DROP POLICY IF EXISTS "alerts_insert_validated" ON alerts;

CREATE POLICY "alerts_insert_validated" ON alerts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (employee_id IS NULL OR employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()))
  )
);

CREATE OR REPLACE FUNCTION set_alerts_created_by()
RETURNS TRIGGER SECURITY DEFINER SET search_path TO '' AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alerts_set_created_by ON alerts;
CREATE TRIGGER alerts_set_created_by
  BEFORE INSERT ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION set_alerts_created_by();

-- 4) Admin trigger fix (drop dependent triggers first, then function)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='auth' AND c.relname='users' AND t.tgname='on_auth_user_role_created'
  ) THEN
    EXECUTE 'DROP TRIGGER on_auth_user_role_created ON auth.users';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='auth' AND c.relname='users' AND t.tgname='on_auth_user_created_role'
  ) THEN
    EXECUTE 'DROP TRIGGER on_auth_user_created_role ON auth.users';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'Field Technician')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 5) Storage buckets: make private
UPDATE storage.buckets
SET public = false
WHERE name IN ('employee-documents', 'fleet-reg-cards', 'receipts', 'fleet-images');