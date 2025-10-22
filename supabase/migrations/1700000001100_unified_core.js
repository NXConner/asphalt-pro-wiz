/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- Core domain tables (idempotent, unified superset)

    CREATE TABLE IF NOT EXISTS public.clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      name text NOT NULL,
      contact_name text,
      email text,
      phone text,
      address text,
      notes text,
      contact jsonb,
      org text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(org_id);

    CREATE TABLE IF NOT EXISTS public.employees (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email text,
      phone text,
      role text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_employees_org ON public.employees(org_id);

    CREATE TABLE IF NOT EXISTS public.job_sites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      name text NOT NULL,
      address text,
      latitude double precision,
      longitude double precision,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_job_sites_org ON public.job_sites(org_id);

    CREATE TABLE IF NOT EXISTS public.jobs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in progress','completed','cancelled')),
      start_date date,
      end_date date,
      budget numeric(12,2),
      location text,
      client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
      job_site_id uuid REFERENCES public.job_sites(id) ON DELETE SET NULL,
      latitude double precision,
      longitude double precision,
      progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_org ON public.jobs(org_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_coordinates ON public.jobs(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

    CREATE TABLE IF NOT EXISTS public.time_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
      job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
      clock_in timestamptz NOT NULL,
      clock_out timestamptz,
      break_duration integer DEFAULT 0,
      notes text,
      date date GENERATED ALWAYS AS (clock_in::date) STORED,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_time_entries_org ON public.time_entries(org_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON public.time_entries(job_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, date);

    CREATE TABLE IF NOT EXISTS public.inventory_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      name text NOT NULL,
      sku text,
      category text NOT NULL,
      quantity numeric(12,2) NOT NULL DEFAULT 0,
      unit text NOT NULL,
      unit_cost numeric(12,2),
      reorder_level numeric(12,2) NOT NULL DEFAULT 0,
      location text,
      supplier text,
      notes text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_inventory_items_org ON public.inventory_items(org_id);

    CREATE TABLE IF NOT EXISTS public.inventory_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
      transaction_type text NOT NULL CHECK (transaction_type IN ('in','out','adjustment','return')),
      quantity numeric(12,2) NOT NULL,
      job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
      employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
      notes text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_inventory_tx_org ON public.inventory_transactions(org_id);

    CREATE TABLE IF NOT EXISTS public.cost_catalog (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      name text NOT NULL,
      description text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_cost_catalog_org ON public.cost_catalog(org_id);

    CREATE TABLE IF NOT EXISTS public.cost_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      catalog_id uuid REFERENCES public.cost_catalog(id) ON DELETE CASCADE,
      item_code text,
      name text NOT NULL,
      description text,
      unit text NOT NULL,
      unit_cost numeric(12,2) NOT NULL,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (catalog_id, item_code)
    );
    CREATE INDEX IF NOT EXISTS idx_cost_items_org ON public.cost_items(org_id);

    CREATE TABLE IF NOT EXISTS public.invoices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
      client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
      total numeric(12,2) NOT NULL DEFAULT 0,
      due_date date,
      status text DEFAULT 'draft',
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(org_id);

    CREATE TABLE IF NOT EXISTS public.invoice_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
      description text NOT NULL,
      quantity numeric(12,2) NOT NULL DEFAULT 1,
      unit text,
      unit_price numeric(12,2) NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_invoice_items_org ON public.invoice_items(org_id);

    CREATE TABLE IF NOT EXISTS public.job_photos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
      url text NOT NULL,
      caption text,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_job_photos_org ON public.job_photos(org_id);

    CREATE TABLE IF NOT EXISTS public.vehicles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      name text NOT NULL,
      plate text,
      status text,
      last_location jsonb,
      created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_vehicles_org ON public.vehicles(org_id);

    CREATE TABLE IF NOT EXISTS public.notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      title text NOT NULL,
      message text NOT NULL,
      read boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(org_id);

    CREATE TABLE IF NOT EXISTS public.activity_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
      action text NOT NULL,
      resource_type text NOT NULL,
      resource_id text,
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(org_id);

    CREATE TABLE IF NOT EXISTS public.safety_training (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
      course_name text NOT NULL,
      completed_on date,
      expires_on date,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_safety_training_org ON public.safety_training(org_id);

    CREATE TABLE IF NOT EXISTS public.employee_violations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
      violation text NOT NULL,
      occurred_on date NOT NULL,
      severity text NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_employee_violations_org ON public.employee_violations(org_id);

    CREATE TABLE IF NOT EXISTS public.disciplinary_actions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
      action text NOT NULL,
      action_date date NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_disciplinary_actions_org ON public.disciplinary_actions(org_id);

    CREATE TABLE IF NOT EXISTS public.employee_compliance_scores (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
      score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
      calculated_on date NOT NULL DEFAULT CURRENT_DATE,
      details jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_employee_compliance_scores_org ON public.employee_compliance_scores(org_id);

    CREATE TABLE IF NOT EXISTS public.map_measurements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      type text NOT NULL CHECK (type IN ('distance','area')),
      value double precision NOT NULL,
      unit text NOT NULL,
      geojson jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_map_measurements_org ON public.map_measurements(org_id);

    -- Attach common triggers
    DO $$
    DECLARE t text;
    BEGIN
      FOR t IN SELECT unnest(ARRAY[
        'clients','employees','job_sites','jobs','time_entries','inventory_items','inventory_transactions',
        'cost_catalog','cost_items','invoices','invoice_items','job_photos','vehicles','notifications',
        'activity_logs','safety_training','employee_violations','disciplinary_actions','employee_compliance_scores',
        'map_measurements'
      ]) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I;', 'set_updated_at_'||t, t);
        EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', 'set_updated_at_'||t, t);
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
