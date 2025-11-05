/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS public.roles (
      name text PRIMARY KEY,
      description text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  pgm.sql(`
    INSERT INTO public.roles (name, description)
    VALUES
      ('viewer', 'Read-only access to organization dashboards and reports'),
      ('operator', 'Operational access for updating jobs, estimates, and schedules'),
      ('manager', 'Management access for approving work and overseeing crews'),
      ('super_admin', 'Full administrative access across organizations')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS public.user_roles (
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role_name text NOT NULL REFERENCES public.roles(name) ON DELETE CASCADE,
      granted_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, role_name)
    );
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        IF to_jsonb(NEW) = to_jsonb(OLD) THEN
          RETURN NEW;
        END IF;
      END IF;
      IF to_jsonb(NEW) ? 'updated_at' THEN
        NEW.updated_at = now();
      END IF;
      RETURN NEW;
    END;
    $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS public.user_roles;`);
  pgm.sql(`DROP TABLE IF EXISTS public.roles;`);
};
