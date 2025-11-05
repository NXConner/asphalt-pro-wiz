/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.current_user_default_org()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT org_id
      FROM public.user_org_memberships
      WHERE user_id = auth.uid()
      ORDER BY joined_at ASC
      LIMIT 1;
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.user_is_member_of_org(_org uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1
        FROM public.user_org_memberships m
        WHERE m.org_id = _org
          AND m.user_id = auth.uid()
      );
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.user_has_org_role(_org uuid, _roles text[])
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1
        FROM public.user_org_memberships m
        WHERE m.org_id = _org
          AND m.user_id = auth.uid()
          AND m.role = ANY(_roles)
      );
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.user_has_role(_role_name text)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role_name = _role_name
      );
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.set_org_and_created_by()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    DECLARE
      v_org uuid;
      has_org boolean := FALSE;
      has_created_by boolean := FALSE;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA
          AND table_name = TG_TABLE_NAME
          AND column_name = 'org_id'
      ) INTO has_org;

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = TG_TABLE_SCHEMA
          AND table_name = TG_TABLE_NAME
          AND column_name = 'created_by'
      ) INTO has_created_by;

      IF has_org AND NEW.org_id IS NULL THEN
        SELECT org_id INTO v_org
        FROM public.user_org_memberships
        WHERE user_id = auth.uid()
        ORDER BY joined_at ASC
        LIMIT 1;

        IF v_org IS NOT NULL THEN
          NEW.org_id := v_org;
        END IF;
      END IF;

      IF has_created_by AND NEW.created_by IS NULL THEN
        BEGIN
          NEW.created_by := auth.uid();
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;

      RETURN NEW;
    END;
    $$;
  `);

  pgm.createTable('feature_flags', {
    id: { type: 'text', primaryKey: true },
    category: { type: 'text' },
    description: { type: 'text', notNull: true },
    default_enabled: { type: 'boolean', notNull: true, default: pgm.func('false') },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('org_feature_flags', {
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    flag_id: { type: 'text', notNull: true, references: 'feature_flags', onDelete: 'cascade' },
    enabled: { type: 'boolean', notNull: true, default: pgm.func('true') },
    payload: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    toggled_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    toggled_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { primaryKey: ['org_id', 'flag_id'] });

  pgm.createTable('user_feature_flags', {
    user_id: { type: 'uuid', notNull: true, references: 'auth.users', onDelete: 'cascade' },
    flag_id: { type: 'text', notNull: true, references: 'feature_flags', onDelete: 'cascade' },
    org_id: { type: 'uuid', references: 'organizations', onDelete: 'cascade' },
    enabled: { type: 'boolean', notNull: true, default: pgm.func('true') },
    expires_at: { type: 'timestamptz' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  }, { primaryKey: ['user_id', 'flag_id'] });

  pgm.createTable('telemetry_events', {
    id: { type: 'bigserial', primaryKey: true },
    org_id: { type: 'uuid', references: 'organizations', onDelete: 'cascade' },
    user_id: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    session_id: { type: 'text' },
    source: { type: 'text' },
    event_name: { type: 'text', notNull: true },
    event_version: { type: 'integer', notNull: true, default: pgm.func('1') },
    properties: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    context: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    occurred_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    received_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('telemetry_metrics', {
    org_id: { type: 'uuid', references: 'organizations', onDelete: 'cascade' },
    metric_key: { type: 'text', notNull: true },
    bucket: { type: 'timestamptz', notNull: true },
    value: { type: 'numeric(18,6)', notNull: true },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('telemetry_metrics', 'telemetry_metrics_unique_bucket', {
    unique: ['org_id', 'metric_key', 'bucket'],
  });

  pgm.createIndex('feature_flags', 'category');
  pgm.createIndex('org_feature_flags', ['flag_id']);
  pgm.createIndex('org_feature_flags', ['org_id']);
  pgm.createIndex('user_feature_flags', ['flag_id']);
  pgm.createIndex('user_feature_flags', ['user_id']);
  pgm.createIndex('telemetry_events', ['org_id', 'occurred_at']);
  pgm.createIndex('telemetry_events', 'event_name');
  pgm.createIndex('telemetry_events', 'properties', { method: 'gin' });
  pgm.createIndex('telemetry_metrics', ['org_id', 'metric_key']);

  pgm.sql(`
    CREATE TRIGGER feature_flags_set_updated_at
      BEFORE UPDATE ON public.feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER org_feature_flags_set_updated_at
      BEFORE UPDATE ON public.org_feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER org_feature_flags_set_org
      BEFORE INSERT ON public.org_feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();

    CREATE TRIGGER user_feature_flags_set_updated_at
      BEFORE UPDATE ON public.user_feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER user_feature_flags_set_org
      BEFORE INSERT ON public.user_feature_flags
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();

    CREATE TRIGGER telemetry_events_set_org
      BEFORE INSERT ON public.telemetry_events
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();

    CREATE TRIGGER telemetry_metrics_set_org
      BEFORE INSERT ON public.telemetry_metrics
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();

    CREATE TRIGGER telemetry_metrics_set_updated_at
      BEFORE UPDATE ON public.telemetry_metrics
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);

  pgm.sql(`
    ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS feature_flags_read ON public.feature_flags;
    DROP POLICY IF EXISTS feature_flags_manage ON public.feature_flags;
    CREATE POLICY feature_flags_read ON public.feature_flags
      FOR SELECT TO authenticated
      USING (true);
    CREATE POLICY feature_flags_manage ON public.feature_flags
      FOR ALL TO authenticated
      USING (public.user_has_role('super_admin'))
      WITH CHECK (public.user_has_role('super_admin'));

    ALTER TABLE public.org_feature_flags ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS org_feature_flags_read ON public.org_feature_flags;
    DROP POLICY IF EXISTS org_feature_flags_manage ON public.org_feature_flags;
    CREATE POLICY org_feature_flags_read ON public.org_feature_flags
      FOR SELECT TO authenticated
      USING (public.user_is_member_of_org(org_id));
    CREATE POLICY org_feature_flags_manage ON public.org_feature_flags
      FOR ALL TO authenticated
      USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']))
      WITH CHECK (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));

    ALTER TABLE public.user_feature_flags ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_feature_flags_read ON public.user_feature_flags;
    DROP POLICY IF EXISTS user_feature_flags_manage ON public.user_feature_flags;
    CREATE POLICY user_feature_flags_read ON public.user_feature_flags
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin'])
      );
    CREATE POLICY user_feature_flags_manage ON public.user_feature_flags
      FOR ALL TO authenticated
      USING (public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin']))
      WITH CHECK (public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin']));

    ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS telemetry_events_read ON public.telemetry_events;
    DROP POLICY IF EXISTS telemetry_events_insert ON public.telemetry_events;
    CREATE POLICY telemetry_events_read ON public.telemetry_events
      FOR SELECT TO authenticated
      USING (
        org_id IS NULL
        OR public.user_is_member_of_org(org_id)
      );
    CREATE POLICY telemetry_events_insert ON public.telemetry_events
      FOR INSERT TO authenticated
      WITH CHECK (
        org_id IS NULL
        OR public.user_is_member_of_org(org_id)
      );

    ALTER TABLE public.telemetry_metrics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS telemetry_metrics_read ON public.telemetry_metrics;
    DROP POLICY IF EXISTS telemetry_metrics_manage ON public.telemetry_metrics;
    CREATE POLICY telemetry_metrics_read ON public.telemetry_metrics
      FOR SELECT TO authenticated
      USING (
        org_id IS NULL
        OR public.user_is_member_of_org(org_id)
      );
    CREATE POLICY telemetry_metrics_manage ON public.telemetry_metrics
      FOR ALL TO authenticated
      USING (public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin']))
      WITH CHECK (public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin']));
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('telemetry_metrics');
  pgm.dropTable('telemetry_events');
  pgm.dropTable('user_feature_flags');
  pgm.dropTable('org_feature_flags');
  pgm.dropTable('feature_flags');
  pgm.sql(`DROP FUNCTION IF EXISTS public.user_has_role(text);`);
  pgm.sql(`DROP FUNCTION IF EXISTS public.user_has_org_role(uuid, text[]);`);
  pgm.sql(`DROP FUNCTION IF EXISTS public.user_is_member_of_org(uuid);`);
  pgm.sql(`DROP FUNCTION IF EXISTS public.set_org_and_created_by();`);
  pgm.sql(`DROP FUNCTION IF EXISTS public.current_user_default_org();`);
};
