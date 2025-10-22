/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- Analysis, scans, defects, slope data, reports, files (idempotent)

    CREATE TABLE IF NOT EXISTS public.scans (
      scan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      site_id uuid REFERENCES public.job_sites(id) ON DELETE SET NULL,
      client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
      timestamp timestamptz NOT NULL DEFAULT now(),
      perimeter_ft numeric,
      area_sqft numeric,
      mesh_url text,
      overlay_json jsonb,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS scans_timestamp_idx ON public.scans(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_scans_org ON public.scans(org_id);

    CREATE TABLE IF NOT EXISTS public.defects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      scan_id uuid NOT NULL REFERENCES public.scans(scan_id) ON DELETE CASCADE,
      type text NOT NULL,
      geometry jsonb NOT NULL,
      length_ft numeric,
      area_sqft numeric,
      severity text,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_defects_org ON public.defects(org_id);

    CREATE TABLE IF NOT EXISTS public.slope_data (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      scan_id uuid NOT NULL REFERENCES public.scans(scan_id) ON DELETE CASCADE,
      pooling_area_sqft numeric,
      risk_zones jsonb,
      slope_map_url text,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_slope_data_org ON public.slope_data(org_id);

    CREATE TABLE IF NOT EXISTS public.reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      scan_id uuid NOT NULL REFERENCES public.scans(scan_id) ON DELETE CASCADE,
      pdf_url text NOT NULL,
      summary text,
      cost_json jsonb,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_reports_org ON public.reports(org_id);

    CREATE TABLE IF NOT EXISTS public.files (
      file_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      scan_id uuid REFERENCES public.scans(scan_id) ON DELETE CASCADE,
      url text NOT NULL,
      type text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_files_org ON public.files(org_id);

    -- Attach common triggers
    DO $$
    DECLARE t text;
    BEGIN
      FOR t IN SELECT unnest(ARRAY['scans','defects','slope_data','reports','files']) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I;', 'set_org_and_created_by_'||t, t);
        EXECUTE format('CREATE TRIGGER %I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();', 'set_org_and_created_by_'||t, t);
      END LOOP;
    END$$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Non-destructive down migration for safety (no-op)
  `);
};
