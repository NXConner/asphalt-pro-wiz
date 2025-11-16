/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const MEASUREMENT_RUNS = 'workflow_measurement_runs';
const MEASUREMENT_SEGMENTS = 'workflow_measurement_segments';
const STAGE_EVENTS = 'workflow_stage_events';
const OUTREACH_TOUCHPOINTS = 'workflow_outreach_touchpoints';
const CONTRACTS = 'workflow_contracts';

const tablesWithOrg = [MEASUREMENT_RUNS, STAGE_EVENTS, OUTREACH_TOUCHPOINTS, CONTRACTS];

exports.up = (pgm) => {
  pgm.createTable(
    { schema: 'public', name: MEASUREMENT_RUNS },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: { type: 'uuid', notNull: true, references: '"public"."organizations"', onDelete: 'cascade' },
      job_id: { type: 'uuid', notNull: true, references: '"public"."jobs"', onDelete: 'cascade' },
      requested_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      strategy: { type: 'text', notNull: true },
      status: { type: 'text', notNull: true, default: 'pending' },
      square_feet: { type: 'numeric' },
      crack_linear_feet: { type: 'numeric' },
      confidence: { type: 'numeric' },
      payload: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      result: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      drone_intel: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      notes: { type: 'text' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );
  pgm.createIndex({ schema: 'public', name: MEASUREMENT_RUNS }, ['job_id'], {
    name: `${MEASUREMENT_RUNS}_job_idx`,
  });
  pgm.createIndex({ schema: 'public', name: MEASUREMENT_RUNS }, ['org_id', 'status'], {
    name: `${MEASUREMENT_RUNS}_org_status_idx`,
  });
  pgm.addConstraint(
    { schema: 'public', name: MEASUREMENT_RUNS },
    `${MEASUREMENT_RUNS}_job_strategy_key`,
    { unique: ['job_id', 'strategy'] },
  );
  pgm.sql(`
    CREATE TRIGGER ${MEASUREMENT_RUNS}_set_updated_at
      BEFORE UPDATE ON public.${MEASUREMENT_RUNS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER ${MEASUREMENT_RUNS}_set_org_defaults
      BEFORE INSERT ON public.${MEASUREMENT_RUNS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
  `);

  pgm.createTable(
    { schema: 'public', name: MEASUREMENT_SEGMENTS },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      measurement_id: {
        type: 'uuid',
        notNull: true,
        references: `"public"."${MEASUREMENT_RUNS}"`,
        onDelete: 'cascade',
      },
      label: { type: 'text', notNull: true },
      square_feet: { type: 'numeric', notNull: true },
      geojson: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );
  pgm.createIndex({ schema: 'public', name: MEASUREMENT_SEGMENTS }, ['measurement_id'], {
    name: `${MEASUREMENT_SEGMENTS}_measurement_idx`,
  });

  pgm.createTable(
    { schema: 'public', name: STAGE_EVENTS },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: { type: 'uuid', notNull: true, references: '"public"."organizations"', onDelete: 'cascade' },
      job_id: { type: 'uuid', notNull: true, references: '"public"."jobs"', onDelete: 'cascade' },
      stage_id: { type: 'text', notNull: true },
      status: { type: 'text', notNull: true },
      notes: { type: 'text' },
      payload: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      performed_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );
  pgm.createIndex({ schema: 'public', name: STAGE_EVENTS }, ['job_id', 'stage_id'], {
    name: `${STAGE_EVENTS}_job_stage_idx`,
  });
  pgm.addConstraint(
    { schema: 'public', name: STAGE_EVENTS },
    `${STAGE_EVENTS}_job_stage_status_key`,
    { unique: ['job_id', 'stage_id', 'status'] },
  );

  pgm.createTable(
    { schema: 'public', name: OUTREACH_TOUCHPOINTS },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: { type: 'uuid', notNull: true, references: '"public"."organizations"', onDelete: 'cascade' },
      job_id: { type: 'uuid', notNull: true, references: '"public"."jobs"', onDelete: 'cascade' },
      contact: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      channel: { type: 'text', notNull: true },
      direction: { type: 'text', notNull: true, default: 'outbound' },
      status: { type: 'text', notNull: true, default: 'draft' },
      subject: { type: 'text' },
      body: { type: 'text' },
      scheduled_at: { type: 'timestamptz' },
      sent_at: { type: 'timestamptz' },
      metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );
  pgm.createIndex({ schema: 'public', name: OUTREACH_TOUCHPOINTS }, ['job_id', 'channel'], {
    name: `${OUTREACH_TOUCHPOINTS}_job_channel_idx`,
  });
  pgm.addConstraint(
    { schema: 'public', name: OUTREACH_TOUCHPOINTS },
    `${OUTREACH_TOUCHPOINTS}_job_channel_subject_key`,
    { unique: ['job_id', 'channel', 'subject'] },
  );
  pgm.sql(`
    CREATE TRIGGER ${OUTREACH_TOUCHPOINTS}_set_updated_at
      BEFORE UPDATE ON public.${OUTREACH_TOUCHPOINTS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER ${OUTREACH_TOUCHPOINTS}_set_org_defaults
      BEFORE INSERT ON public.${OUTREACH_TOUCHPOINTS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
  `);

  pgm.createTable(
    { schema: 'public', name: CONTRACTS },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: { type: 'uuid', notNull: true, references: '"public"."organizations"', onDelete: 'cascade' },
      job_id: { type: 'uuid', notNull: true, references: '"public"."jobs"', onDelete: 'cascade' },
      estimate_id: { type: 'uuid', references: '"public"."estimates"', onDelete: 'set null' },
      version: { type: 'integer', notNull: true, default: 1 },
      status: { type: 'text', notNull: true, default: 'draft' },
      total: { type: 'numeric' },
      currency: { type: 'text', notNull: true, default: 'USD' },
      doc_url: { type: 'text' },
      esign_provider: { type: 'text' },
      esign_envelope_id: { type: 'text' },
      metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );
  pgm.addConstraint(
    { schema: 'public', name: CONTRACTS },
    `${CONTRACTS}_job_version_key`,
    { unique: ['job_id', 'version'] },
  );
  pgm.createIndex({ schema: 'public', name: CONTRACTS }, ['job_id', 'status'], {
    name: `${CONTRACTS}_job_status_idx`,
  });
  pgm.sql(`
    CREATE TRIGGER ${CONTRACTS}_set_updated_at
      BEFORE UPDATE ON public.${CONTRACTS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER ${CONTRACTS}_set_org_defaults
      BEFORE INSERT ON public.${CONTRACTS}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
  `);

  tablesWithOrg.forEach((table) => {
    pgm.sql(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY ${table}_select ON public.${table}
        FOR SELECT TO authenticated
        USING (public.user_is_member_of_org(org_id));
    `);
    pgm.sql(`
      CREATE POLICY ${table}_insert ON public.${table}
        FOR INSERT TO authenticated
        WITH CHECK (
          public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['operator','manager','super_admin'])
        );
    `);
    pgm.sql(`
      CREATE POLICY ${table}_update ON public.${table}
        FOR UPDATE TO authenticated
        USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']))
        WITH CHECK (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
    `);
    pgm.sql(`
      CREATE POLICY ${table}_delete ON public.${table}
        FOR DELETE TO authenticated
        USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
    `);
  });

  pgm.sql(`ALTER TABLE public.${MEASUREMENT_SEGMENTS} ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY ${MEASUREMENT_SEGMENTS}_select ON public.${MEASUREMENT_SEGMENTS}
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.${MEASUREMENT_RUNS} r
          WHERE r.id = ${MEASUREMENT_SEGMENTS}.measurement_id
            AND public.user_is_member_of_org(r.org_id)
        )
      );
  `);
  pgm.sql(`
    CREATE POLICY ${MEASUREMENT_SEGMENTS}_insert ON public.${MEASUREMENT_SEGMENTS}
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.${MEASUREMENT_RUNS} r
          WHERE r.id = ${MEASUREMENT_SEGMENTS}.measurement_id
            AND public.user_has_org_role(r.org_id, ARRAY['operator','manager','super_admin'])
        )
      );
  `);
  pgm.sql(`
    CREATE POLICY ${MEASUREMENT_SEGMENTS}_delete ON public.${MEASUREMENT_SEGMENTS}
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.${MEASUREMENT_RUNS} r
          WHERE r.id = ${MEASUREMENT_SEGMENTS}.measurement_id
            AND public.user_has_org_role(r.org_id, ARRAY['manager','super_admin'])
        )
      );
  `);

  pgm.sql(`ALTER TABLE public.${MEASUREMENT_SEGMENTS} FORCE ROW LEVEL SECURITY;`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS public.${MEASUREMENT_SEGMENTS} CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS public.${CONTRACTS} CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS public.${OUTREACH_TOUCHPOINTS} CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS public.${STAGE_EVENTS} CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS public.${MEASUREMENT_RUNS} CASCADE;`);
};
