/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- Core extensions
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Unified role enum
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'app_role' AND n.nspname = 'public'
      ) THEN
        CREATE TYPE public.app_role AS ENUM (
          'Super Administrator',
          'Administrator',
          'Manager',
          'Operator',
          'Viewer'
        );
      END IF;
    END$$;

    -- Organizations and user profile data
    CREATE TABLE IF NOT EXISTS public.organizations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text UNIQUE,
      settings jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.user_profiles (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      display_name text,
      avatar_url text,
      locale text,
      preferences jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.user_org_memberships (
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      role public.app_role NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, org_id)
    );

    -- Helper functions for authorization and membership checks
    CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
    RETURNS boolean
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.user_org_memberships m
        WHERE m.user_id = _user_id
          AND m.role IN ('Super Administrator','Administrator')
      );
    $$;

    CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
    RETURNS boolean
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.user_org_memberships m
        WHERE m.user_id = _user_id AND m.role = _role
      );
    $$;

    CREATE OR REPLACE FUNCTION public.user_in_org(_org uuid)
    RETURNS boolean
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.user_org_memberships m
        WHERE m.org_id = _org AND m.user_id = auth.uid()
      );
    $$;

    CREATE OR REPLACE FUNCTION public.current_user_default_org()
    RETURNS uuid
    LANGUAGE SQL
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT org_id
      FROM public.user_org_memberships
      WHERE user_id = auth.uid()
      ORDER BY created_at ASC
      LIMIT 1;
    $$;

    -- Generic helper trigger functions
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;

    CREATE OR REPLACE FUNCTION public.set_org_and_created_by()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      v_org uuid;
    BEGIN
      IF NEW.org_id IS NULL THEN
        v_org := public.current_user_default_org();
        IF v_org IS NOT NULL THEN
          NEW.org_id := v_org;
        END IF;
      END IF;

      -- Conditionally set created_by if column exists
      BEGIN
        PERFORM 1 FROM information_schema.columns
         WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME AND column_name = 'created_by';
        IF FOUND AND NEW.created_by IS NULL THEN
          BEGIN
            NEW.created_by := auth.uid();
          EXCEPTION WHEN OTHERS THEN
            -- ignore if not in auth context
            NULL;
          END;
        END IF;
      END;

      RETURN NEW;
    END;
    $$;

    -- Auto-membership for new auth users
    CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
    RETURNS trigger AS $$
    DECLARE
      v_org uuid;
    BEGIN
      INSERT INTO public.user_profiles(user_id, display_name)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
      ON CONFLICT (user_id) DO NOTHING;

      -- Ensure default organization
      INSERT INTO public.organizations(name, slug)
      SELECT 'Default Organization', 'default'
      WHERE NOT EXISTS (SELECT 1 FROM public.organizations);

      SELECT id INTO v_org FROM public.organizations
      ORDER BY created_at ASC
      LIMIT 1;

      INSERT INTO public.user_org_memberships(user_id, org_id, role)
      VALUES (NEW.id, v_org, 'Viewer')
      ON CONFLICT (user_id, org_id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

    -- RLS enablement
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_org_memberships ENABLE ROW LEVEL SECURITY;

    -- Policies
    CREATE POLICY IF NOT EXISTS orgs_read ON public.organizations
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_org_memberships m
          WHERE m.org_id = organizations.id AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY IF NOT EXISTS orgs_manage_admin ON public.organizations
      FOR ALL TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));

    CREATE POLICY IF NOT EXISTS profiles_read_own ON public.user_profiles
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY IF NOT EXISTS profiles_manage_own ON public.user_profiles
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY IF NOT EXISTS memberships_read_own_orgs ON public.user_org_memberships
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid() OR public.is_admin(auth.uid())
      );

    CREATE POLICY IF NOT EXISTS memberships_manage_admin ON public.user_org_memberships
      FOR ALL TO authenticated
      USING (public.is_admin(auth.uid()))
      WITH CHECK (public.is_admin(auth.uid()));

    -- Seed a default organization when none exists
    INSERT INTO public.organizations (name, slug)
    SELECT 'Default Organization', 'default'
    WHERE NOT EXISTS (SELECT 1 FROM public.organizations);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Non-destructive down migration for safety (no-op)
  `);
};
