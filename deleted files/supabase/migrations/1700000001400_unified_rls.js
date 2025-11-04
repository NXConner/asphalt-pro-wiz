/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- Enable RLS and apply unified org-based policies broadly

    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN (
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name IN (
            'clients','employees','job_sites','jobs','time_entries','inventory_items','inventory_transactions',
            'cost_catalog','cost_items','invoices','invoice_items','job_photos','vehicles','notifications',
            'activity_logs','safety_training','employee_violations','disciplinary_actions','employee_compliance_scores',
            'map_measurements','scans','defects','slope_data','reports','files','ai_asphalt_detections',
            'game_events','game_profiles','game_badges','game_quests','game_redemptions'
          )
      ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);

        -- Select policy: any member of the same org can read
        EXECUTE format($$CREATE POLICY IF NOT EXISTS %I ON public.%I
          FOR SELECT TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.user_org_memberships m
              WHERE m.org_id = %I.org_id
                AND m.user_id = auth.uid()
            )
          );$$, r.table_name || '_select_by_org', r.table_name, r.table_name);

        -- Insert/Update/Delete: managers and above in same org
        EXECUTE format($$CREATE POLICY IF NOT EXISTS %I ON public.%I
          FOR INSERT TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.user_org_memberships m
              WHERE m.org_id = %I.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('Manager','Administrator','Super Administrator')
            )
          );$$, r.table_name || '_insert_manage', r.table_name, r.table_name);

        EXECUTE format($$CREATE POLICY IF NOT EXISTS %I ON public.%I
          FOR UPDATE TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.user_org_memberships m
              WHERE m.org_id = %I.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('Manager','Administrator','Super Administrator')
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.user_org_memberships m
              WHERE m.org_id = %I.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('Manager','Administrator','Super Administrator')
            )
          );$$, r.table_name || '_update_manage', r.table_name, r.table_name, r.table_name);

        EXECUTE format($$CREATE POLICY IF NOT EXISTS %I ON public.%I
          FOR DELETE TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.user_org_memberships m
              WHERE m.org_id = %I.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('Manager','Administrator','Super Administrator')
            )
          );$$, r.table_name || '_delete_manage', r.table_name, r.table_name);
      END LOOP;
    END$$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Non-destructive down migration for safety (no-op)
  `);
};
