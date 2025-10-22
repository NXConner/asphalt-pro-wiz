-- Core entities shared across apps (idempotent)
-- Requires: 1700000001000_unified_tenancy.js

-- Jobs and clients
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in progress','completed','cancelled')),
  start_date date,
  end_date date,
  budget numeric(12,2),
  location text,
  latitude double precision,
  longitude double precision,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_org ON public.jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_jobs_coords ON public.jobs(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  total numeric(12,2) NOT NULL DEFAULT 0,
  due_date date,
  status text DEFAULT 'draft',
  meta jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_code text,
  description text,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit text NOT NULL,
  unit_cost numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Workforce
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_time_entries_job ON public.time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_emp_date ON public.time_entries(employee_id, date);

-- Inventory & cost catalog
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
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('in','out','adjustment','return')),
  quantity numeric(12,2) NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cost_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid REFERENCES public.cost_catalog(id) ON DELETE CASCADE,
  item_code text,
  name text NOT NULL,
  description text,
  unit text NOT NULL,
  unit_cost numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Hooks
DROP TRIGGER IF EXISTS trg_jobs_updated ON public.jobs;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_clients_updated ON public.clients;
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Default org and created_by setters
DROP TRIGGER IF EXISTS trg_jobs_defaults ON public.jobs;
CREATE TRIGGER trg_jobs_defaults BEFORE INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();

DROP TRIGGER IF EXISTS trg_clients_defaults ON public.clients;
CREATE TRIGGER trg_clients_defaults BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();

DROP TRIGGER IF EXISTS trg_employees_defaults ON public.employees;
CREATE TRIGGER trg_employees_defaults BEFORE INSERT ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();

-- RLS enablement
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;

-- Base tenant policies (per-org)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('clients','jobs','invoices','invoice_items','employees','time_entries','inventory_items','inventory_transactions','cost_catalog','cost_items')
  ) LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_org_memberships m WHERE m.user_id = auth.uid() AND m.org_id = %I.org_id));',
                   'tenant_select_' || r.table_name, r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_org_memberships m WHERE m.user_id = auth.uid() AND m.org_id = %I.org_id));',
                   'tenant_insert_' || r.table_name, r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_org_memberships m WHERE m.user_id = auth.uid() AND m.org_id = %I.org_id)) WITH CHECK (EXISTS (SELECT 1 FROM public.user_org_memberships m WHERE m.user_id = auth.uid() AND m.org_id = %I.org_id));',
                   'tenant_update_' || r.table_name, r.table_name, r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_org_memberships m WHERE m.user_id = auth.uid() AND m.org_id = %I.org_id));',
                   'tenant_delete_' || r.table_name, r.table_name, r.table_name);
  END LOOP;
END$$;
