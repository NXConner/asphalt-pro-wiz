/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const JOB_SCOPED_TABLES = [
  { name: 'mission_milestones', jobColumn: 'job_id' },
  { name: 'mission_checklists', jobColumn: 'job_id' },
  { name: 'customer_portal_sessions', jobColumn: 'job_id' },
  { name: 'customer_portal_events', jobColumn: 'job_id' },
  { name: 'compliance_artifacts', jobColumn: 'job_id' },
  { name: 'compliance_reviews', jobColumn: 'job_id' },
  { name: 'optimizer_runs', jobColumn: 'job_id' },
  { name: 'optimizer_suggestions', jobColumn: 'job_id' },
  { name: 'weather_snapshots', jobColumn: 'job_id' },
];

const ORG_SCOPED_TABLES = ['knowledge_documents', 'knowledge_chunks', 'observability_sessions'];

exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`);
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "vector";`);

  pgm.createType('milestone_status', ['planned', 'in_progress', 'blocked', 'completed', 'deferred']);
  pgm.createType('review_outcome', ['pending', 'approved', 'changes_requested', 'rejected']);
  pgm.createType('optimizer_status', ['pending', 'running', 'completed', 'failed']);

  pgm.createTable('mission_milestones', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    sequence: { type: 'integer', notNull: true, default: 1 },
    title: { type: 'text', notNull: true },
    description: { type: 'text' },
    status: { type: 'milestone_status', notNull: true, default: 'planned' },
    target_start: { type: 'timestamptz' },
    target_finish: { type: 'timestamptz' },
    actual_start: { type: 'timestamptz' },
    actual_finish: { type: 'timestamptz' },
    dependencies: { type: 'uuid[]' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('mission_milestones', ['job_id', 'sequence']);
  pgm.addConstraint('mission_milestones', 'mission_milestones_job_sequence_key', {
    unique: ['job_id', 'sequence'],
  });

  pgm.createTable('mission_checklists', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    category: { type: 'text' },
    item: { type: 'text', notNull: true },
    is_required: { type: 'boolean', notNull: true, default: pgm.func('true') },
    is_completed: { type: 'boolean', notNull: true, default: pgm.func('false') },
    completed_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    completed_at: { type: 'timestamptz' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('mission_checklists', ['job_id', 'category']);
  pgm.addConstraint('mission_checklists', 'mission_checklists_job_item_key', {
    unique: ['job_id', 'item'],
  });

  pgm.createTable('customer_portal_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    contact_email: { type: 'text', notNull: true },
    contact_name: { type: 'text' },
    token_hash: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: pgm.func("'active'::text") },
    expires_at: { type: 'timestamptz' },
    last_accessed_at: { type: 'timestamptz' },
    feature_flags: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    revoked_at: { type: 'timestamptz' },
  });
  pgm.createIndex('customer_portal_sessions', ['job_id', 'status']);
  pgm.createIndex('customer_portal_sessions', 'token_hash', { unique: true });
  pgm.addConstraint('customer_portal_sessions', 'customer_portal_sessions_job_contact_key', {
    unique: ['job_id', 'contact_email'],
  });

  pgm.createTable('customer_portal_events', {
    id: 'bigserial',
    session_id: { type: 'uuid', notNull: true, references: 'customer_portal_sessions', onDelete: 'cascade' },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    event_type: { type: 'text', notNull: true },
    actor_ip: { type: 'inet' },
    actor_user_agent: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    occurred_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('customer_portal_events', ['job_id', 'event_type']);

  pgm.createTable('compliance_artifacts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    artifact_type: { type: 'text', notNull: true },
    storage_path: { type: 'text', notNull: true },
    checksum: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    uploaded_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    uploaded_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    verified: { type: 'boolean', notNull: true, default: pgm.func('false') },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('compliance_artifacts', ['job_id', 'artifact_type']);
  pgm.addConstraint('compliance_artifacts', 'compliance_artifacts_job_path_key', {
    unique: ['job_id', 'storage_path'],
  });

  pgm.createTable('compliance_reviews', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    reviewer_id: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    outcome: { type: 'review_outcome', notNull: true, default: 'pending' },
    notes: { type: 'text' },
    submitted_at: { type: 'timestamptz' },
    artifacts: { type: 'uuid[]' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('compliance_reviews', ['job_id', 'outcome']);

  pgm.createTable('knowledge_documents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    title: { type: 'text', notNull: true },
    source: { type: 'text' },
    document_type: { type: 'text', notNull: true, default: pgm.func("'general'::text") },
    language: { type: 'text', default: 'en' },
    tags: { type: 'text[]', notNull: true, default: pgm.func("'{}'::text[]") },
    content: { type: 'text', notNull: true },
    embedding: { type: 'vector(1536)' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('knowledge_documents', ['org_id', 'document_type']);
  pgm.createIndex('knowledge_documents', 'title', { method: 'gin', opclass: 'gin_trgm_ops' });
  pgm.addConstraint('knowledge_documents', 'knowledge_documents_org_title_key', {
    unique: ['org_id', 'title'],
  });

  pgm.createTable('knowledge_chunks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    document_id: { type: 'uuid', notNull: true, references: 'knowledge_documents', onDelete: 'cascade' },
    chunk_index: { type: 'integer', notNull: true },
    content: { type: 'text', notNull: true },
    token_count: { type: 'integer' },
    embedding: { type: 'vector(1536)' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('knowledge_chunks', ['document_id', 'chunk_index'], { unique: true });
  pgm.addConstraint('knowledge_chunks', 'knowledge_chunks_org_doc_index_ck', {
    check: '(org_id IS NOT NULL)',
  });
  pgm.createIndex('knowledge_chunks', 'embedding', { method: 'ivfflat', with: '(lists = 100)', where: 'embedding IS NOT NULL' });

  pgm.createTable('optimizer_runs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    scenario_name: { type: 'text', notNull: true },
    status: { type: 'optimizer_status', notNull: true, default: 'pending' },
    input_outline: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    constraints: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    result_summary: { type: 'jsonb', default: pgm.func("'{}'::jsonb") },
    metrics: { type: 'jsonb', default: pgm.func("'{}'::jsonb") },
    started_at: { type: 'timestamptz' },
    completed_at: { type: 'timestamptz' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('optimizer_runs', ['job_id', 'status']);

  pgm.createTable('optimizer_suggestions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    run_id: { type: 'uuid', notNull: true, references: 'optimizer_runs', onDelete: 'cascade' },
    label: { type: 'text', notNull: true },
    description: { type: 'text' },
    impact_score: { type: 'numeric', default: 0 },
    geometry: { type: 'jsonb' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('optimizer_suggestions', ['run_id']);

  pgm.createTable('weather_snapshots', {
    id: 'bigserial',
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    provider: { type: 'text', notNull: true },
    recorded_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    forecast: { type: 'jsonb' },
    observed: { type: 'jsonb' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('weather_snapshots', ['job_id', 'provider']);

  pgm.createTable('observability_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    session_key: { type: 'text', notNull: true },
    user_id: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    started_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    ended_at: { type: 'timestamptz' },
    device: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    network: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('observability_sessions', ['org_id', 'started_at']);
  pgm.createIndex('observability_sessions', 'session_key', { unique: true });

  // Triggers
  const UPDATED_AT_TABLES = [
    'mission_milestones',
    'mission_checklists',
    'customer_portal_sessions',
    'compliance_artifacts',
    'compliance_reviews',
    'knowledge_documents',
    'optimizer_runs',
    'observability_sessions',
  ];

  UPDATED_AT_TABLES.forEach((table) => {
    pgm.sql(`CREATE TRIGGER ${table}_set_updated_at BEFORE UPDATE ON public.${table} FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`);
  });

const CREATED_BY_TABLES = [
  'mission_milestones',
  'mission_checklists',
  'customer_portal_sessions',
  'compliance_artifacts',
  'compliance_reviews',
  'knowledge_documents',
  'knowledge_chunks',
  'optimizer_runs',
  'observability_sessions',
];

  CREATED_BY_TABLES.forEach((table) => {
    pgm.sql(`CREATE TRIGGER ${table}_set_org BEFORE INSERT ON public.${table} FOR EACH ROW EXECUTE FUNCTION public.set_org_and_created_by();`);
  });

  // RLS policies for job-scoped tables
  JOB_SCOPED_TABLES.forEach(({ name, jobColumn }) => {
    pgm.sql(`ALTER TABLE public.${name} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY ${name}_select ON public.${name}
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = ${name}.${jobColumn}
              AND EXISTS (
                SELECT 1 FROM public.user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
              )
          )
        );

      CREATE POLICY ${name}_insert ON public.${name}
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = NEW.${jobColumn}
              AND EXISTS (
                SELECT 1 FROM public.user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('operator','manager','super_admin')
              )
          )
        );

      CREATE POLICY ${name}_update ON public.${name}
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = ${name}.${jobColumn}
              AND EXISTS (
                SELECT 1 FROM public.user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = NEW.${jobColumn}
              AND EXISTS (
                SELECT 1 FROM public.user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        );

      CREATE POLICY ${name}_delete ON public.${name}
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = ${name}.${jobColumn}
              AND EXISTS (
                SELECT 1 FROM public.user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        );
    `);
  });

  // RLS policies for org-scoped tables
  ORG_SCOPED_TABLES.forEach((name) => {
    pgm.sql(`ALTER TABLE public.${name} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY ${name}_select ON public.${name}
        FOR SELECT TO authenticated
        USING (
          public.user_is_member_of_org(${name}.org_id)
        );

      CREATE POLICY ${name}_insert ON public.${name}
        FOR INSERT TO authenticated
        WITH CHECK (
          public.user_has_org_role(COALESCE(NEW.org_id, public.current_user_default_org()), ARRAY['operator','manager','super_admin'])
        );

      CREATE POLICY ${name}_update ON public.${name}
        FOR UPDATE TO authenticated
        USING (
          public.user_has_org_role(${name}.org_id, ARRAY['manager','super_admin'])
        )
        WITH CHECK (
          public.user_has_org_role(${name}.org_id, ARRAY['manager','super_admin'])
        );

      CREATE POLICY ${name}_delete ON public.${name}
        FOR DELETE TO authenticated
        USING (
          public.user_has_org_role(${name}.org_id, ARRAY['manager','super_admin'])
        );
    `);
  });
};

exports.down = (pgm) => {
  const dropTrigger = (name, trigger) => {
    pgm.sql(`DROP TRIGGER IF EXISTS ${trigger} ON public.${name};`);
  };

  const dropPolicy = (table, policy) => {
    pgm.sql(`DROP POLICY IF EXISTS ${policy} ON public.${table};`);
  };

  JOB_SCOPED_TABLES.forEach(({ name }) => {
    dropPolicy(name, `${name}_select`);
    dropPolicy(name, `${name}_insert`);
    dropPolicy(name, `${name}_update`);
    dropPolicy(name, `${name}_delete`);
    pgm.sql(`ALTER TABLE public.${name} DISABLE ROW LEVEL SECURITY;`);
  });

  ORG_SCOPED_TABLES.forEach((name) => {
    dropPolicy(name, `${name}_select`);
    dropPolicy(name, `${name}_insert`);
    dropPolicy(name, `${name}_update`);
    dropPolicy(name, `${name}_delete`);
    pgm.sql(`ALTER TABLE public.${name} DISABLE ROW LEVEL SECURITY;`);
  });

  const updatedAtTables = [
    'mission_milestones',
    'mission_checklists',
    'customer_portal_sessions',
    'compliance_artifacts',
    'compliance_reviews',
    'knowledge_documents',
    'optimizer_runs',
    'observability_sessions',
  ];

  updatedAtTables.forEach((table) => {
    dropTrigger(table, `${table}_set_updated_at`);
  });

  const createdByTables = [
    'mission_milestones',
    'mission_checklists',
    'customer_portal_sessions',
    'compliance_artifacts',
    'compliance_reviews',
    'knowledge_documents',
    'knowledge_chunks',
    'optimizer_runs',
    'observability_sessions',
  ];

  createdByTables.forEach((table) => {
    dropTrigger(table, `${table}_set_org`);
  });

  pgm.dropTable('observability_sessions');
  pgm.dropTable('weather_snapshots');
  pgm.dropTable('optimizer_suggestions');
  pgm.dropTable('optimizer_runs');
  pgm.dropTable('knowledge_chunks');
  pgm.dropTable('knowledge_documents');
  pgm.dropTable('compliance_reviews');
  pgm.dropTable('compliance_artifacts');
  pgm.dropTable('customer_portal_events');
  pgm.dropTable('customer_portal_sessions');
  pgm.dropTable('mission_checklists');
  pgm.dropTable('mission_milestones');

  pgm.sql(`DROP TYPE IF EXISTS optimizer_status;`);
  pgm.sql(`DROP TYPE IF EXISTS review_outcome;`);
  pgm.sql(`DROP TYPE IF EXISTS milestone_status;`);
};
