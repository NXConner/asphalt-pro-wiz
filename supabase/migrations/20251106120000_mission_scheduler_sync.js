/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const TASK_STATUS = ['planned', 'scheduled', 'in_progress', 'completed', 'blocked'];
const TASK_PRIORITY = ['critical', 'standard', 'low'];
const ACCESSIBILITY_IMPACT = ['entrance', 'parking', 'mobility', 'auditorium', 'walkway', 'none'];

exports.up = (pgm) => {
  pgm.createType('mission_task_status', TASK_STATUS);
  pgm.createType('mission_task_priority', TASK_PRIORITY);
  pgm.createType('mission_accessibility_impact', ACCESSIBILITY_IMPACT);

  pgm.createTable('mission_crew_members', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    name: { type: 'text', notNull: true },
    role: { type: 'text' },
    color: { type: 'text' },
    max_hours_per_day: { type: 'integer', notNull: true, default: 10 },
    availability: { type: 'text[]', notNull: true, default: pgm.func("ARRAY['sun','mon','tue','wed','thu','fri','sat']::text[]") },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('mission_crew_members', ['org_id']);
  pgm.addConstraint('mission_crew_members', 'mission_crew_members_org_name_key', {
    unique: ['org_id', 'name'],
  });

  pgm.createTable('mission_tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', notNull: true, references: 'organizations', onDelete: 'cascade' },
    job_id: { type: 'uuid', references: 'jobs', onDelete: 'set null' },
    job_name: { type: 'text' },
    site: { type: 'text' },
    start_at: { type: 'timestamptz', notNull: true },
    end_at: { type: 'timestamptz', notNull: true },
    crew_required: { type: 'integer', notNull: true, default: 1 },
    crew_assigned_ids: { type: 'text[]', notNull: true, default: pgm.func("ARRAY[]::text[]") },
    status: { type: 'mission_task_status', notNull: true, default: 'planned' },
    priority: { type: 'mission_task_priority', notNull: true, default: 'standard' },
    accessibility_impact: { type: 'mission_accessibility_impact', notNull: true, default: 'none' },
    notes: { type: 'text' },
    color: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('mission_tasks', ['org_id']);
  pgm.createIndex('mission_tasks', ['status']);
  pgm.createIndex('mission_tasks', ['start_at']);
  pgm.addConstraint('mission_tasks', 'mission_tasks_org_job_start_key', {
    unique: ['org_id', 'job_name', 'start_at'],
  });

  const updatedAtTables = ['mission_crew_members', 'mission_tasks'];
  updatedAtTables.forEach((table) => {
    pgm.sql(`
      CREATE TRIGGER ${table}_set_updated_at
      BEFORE UPDATE ON public.${table}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
    `);
  });

  const createdByTables = ['mission_crew_members', 'mission_tasks'];
  createdByTables.forEach((table) => {
    pgm.sql(`
      CREATE TRIGGER ${table}_set_org
      BEFORE INSERT ON public.${table}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
    `);
  });

  const policyTables = ['mission_crew_members', 'mission_tasks'];
  policyTables.forEach((table) => {
    pgm.sql(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY ${table}_select ON public.${table}
        FOR SELECT TO authenticated
        USING (public.user_is_member_of_org(${table}.org_id));

      CREATE POLICY ${table}_insert ON public.${table}
        FOR INSERT TO authenticated
        WITH CHECK (public.user_has_org_role(COALESCE(${table}.org_id, public.current_user_default_org()), ARRAY['operator','manager','super_admin']));

      CREATE POLICY ${table}_update ON public.${table}
        FOR UPDATE TO authenticated
        USING (public.user_has_org_role(${table}.org_id, ARRAY['manager','super_admin']))
        WITH CHECK (public.user_has_org_role(${table}.org_id, ARRAY['manager','super_admin']));

      CREATE POLICY ${table}_delete ON public.${table}
        FOR DELETE TO authenticated
        USING (public.user_has_org_role(${table}.org_id, ARRAY['manager','super_admin']));
    `);
  });
};

exports.down = (pgm) => {
  const policyTables = ['mission_tasks', 'mission_crew_members'];
  policyTables.forEach((table) => {
    pgm.sql(`DROP POLICY IF EXISTS ${table}_select ON public.${table};`);
    pgm.sql(`DROP POLICY IF EXISTS ${table}_insert ON public.${table};`);
    pgm.sql(`DROP POLICY IF EXISTS ${table}_update ON public.${table};`);
    pgm.sql(`DROP POLICY IF EXISTS ${table}_delete ON public.${table};`);
    pgm.sql(`ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`);
  });

  const triggerTables = ['mission_tasks', 'mission_crew_members'];
  triggerTables.forEach((table) => {
    pgm.sql(`DROP TRIGGER IF EXISTS ${table}_set_updated_at ON public.${table};`);
    pgm.sql(`DROP TRIGGER IF EXISTS ${table}_set_org ON public.${table};`);
  });

  pgm.dropTable('mission_tasks');
  pgm.dropTable('mission_crew_members');

  pgm.dropType('mission_accessibility_impact');
  pgm.dropType('mission_task_priority');
  pgm.dropType('mission_task_status');
};
