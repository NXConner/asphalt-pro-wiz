/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    -- Compatibility: asphalt-pro-wiz expects public.users/roles/user_roles
    -- Map to auth.users and memberships/roles via views and helper mapping

    CREATE TABLE IF NOT EXISTS public.roles_compat (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE
    );

    INSERT INTO public.roles_compat(name) VALUES
      ('viewer'),('operator'),('manager'),('super_admin')
    ON CONFLICT (name) DO NOTHING;

    CREATE OR REPLACE VIEW public.users AS
      SELECT u.id, u.email, (up.display_name) AS full_name, u.created_at
      FROM auth.users u
      LEFT JOIN public.user_profiles up ON up.user_id = u.id;

    CREATE OR REPLACE VIEW public.roles AS
      SELECT id, name FROM public.roles_compat;

    CREATE OR REPLACE VIEW public.user_roles AS
      SELECT m.user_id,
             rc.id AS role_id,
             m.created_at AS granted_at
      FROM public.user_org_memberships m
      JOIN public.roles_compat rc
        ON (
          (m.role = 'Viewer' AND rc.name = 'viewer') OR
          (m.role = 'Operator' AND rc.name = 'operator') OR
          (m.role = 'Manager' AND rc.name = 'manager') OR
          (m.role = 'Administrator' AND rc.name = 'manager') OR -- map admin to manager for legacy
          (m.role = 'Super Administrator' AND rc.name = 'super_admin')
        );

    -- Compatibility aliases for hero-ops-suite and others
    -- customers -> clients
    CREATE OR REPLACE VIEW public.customers AS
      SELECT id, name, coalesce(email, (contact->>'email')) AS email,
             coalesce(address, '') AS address,
             now() AS updated_at,
             created_at
      FROM public.clients;

    -- Mapmeasurements (camel) -> map_measurements
    CREATE OR REPLACE VIEW public."Mapmeasurements" AS
      SELECT id, type, value, unit, geojson, created_at
      FROM public.map_measurements;

    -- clients with legacy pk name
    CREATE OR REPLACE VIEW public.clients_compat AS
      SELECT id AS client_id, name AS org, contact, created_at
      FROM public.clients;

    -- Security: expose views to anon/authenticated safely
    GRANT SELECT ON public.users TO anon, authenticated;
    GRANT SELECT ON public.roles TO anon, authenticated;
    GRANT SELECT ON public.user_roles TO authenticated;
    GRANT SELECT ON public.customers TO authenticated;
    GRANT SELECT ON public."Mapmeasurements" TO authenticated;
    GRANT SELECT ON public.clients_compat TO authenticated;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Non-destructive down migration for safety (no-op)
  `);
};
