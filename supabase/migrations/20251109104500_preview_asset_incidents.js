/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const INCIDENT_SEVERITIES = ['info', 'warning', 'error', 'critical'];

exports.up = (pgm) => {
  pgm.createTable('preview_asset_incidents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    org_id: { type: 'uuid', references: 'organizations', onDelete: 'set null' },
    user_id: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    session_id: { type: 'text' },
    device_id: { type: 'text' },
    event_type: { type: 'text', notNull: true },
    severity: { type: 'text', notNull: true, default: pgm.func(`'error'::text`) },
    asset_url: { type: 'text' },
    asset_tag: { type: 'text' },
    page_url: { type: 'text' },
    referrer: { type: 'text' },
    reason: { type: 'text' },
    message: { type: 'text' },
    environment: { type: 'text' },
    user_agent: { type: 'text' },
    incident_hash: { type: 'text' },
    occurred_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('preview_asset_incidents', 'preview_asset_incidents_severity_check', {
    check: `severity = ANY('{${INCIDENT_SEVERITIES.join(',')}}'::text[])`,
  });

  pgm.createIndex('preview_asset_incidents', 'occurred_at');
  pgm.createIndex('preview_asset_incidents', ['event_type', 'occurred_at']);
  pgm.createIndex('preview_asset_incidents', ['asset_url', 'occurred_at']);
  pgm.createIndex('preview_asset_incidents', 'incident_hash');

  pgm.sql(`
    CREATE TRIGGER preview_asset_incidents_set_org
      BEFORE INSERT ON public.preview_asset_incidents
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();

    CREATE TRIGGER preview_asset_incidents_set_updated_at
      BEFORE UPDATE ON public.preview_asset_incidents
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);

  pgm.sql(`
    ALTER TABLE public.preview_asset_incidents ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS preview_asset_incidents_select ON public.preview_asset_incidents;
    CREATE POLICY preview_asset_incidents_select
      ON public.preview_asset_incidents
      FOR SELECT
      TO authenticated
      USING (
        org_id IS NULL
        OR public.user_is_member_of_org(org_id)
      );

    DROP POLICY IF EXISTS preview_asset_incidents_insert ON public.preview_asset_incidents;
    CREATE POLICY preview_asset_incidents_insert
      ON public.preview_asset_incidents
      FOR INSERT
      TO authenticated
      WITH CHECK (
        org_id IS NULL
        OR public.user_is_member_of_org(org_id)
      );
  `);

  pgm.sql(`
    CREATE VIEW public.preview_asset_incident_summary AS
    SELECT
      asset_url,
      page_url,
      event_type,
      severity,
      COUNT(*) AS total_events,
      MAX(occurred_at) AS last_occurred_at,
      MIN(occurred_at) AS first_occurred_at,
      COUNT(*) FILTER (WHERE occurred_at >= now() - interval '1 hour') AS events_last_hour,
      COUNT(*) FILTER (WHERE occurred_at >= now() - interval '24 hours') AS events_last_day
    FROM public.preview_asset_incidents
    GROUP BY asset_url, page_url, event_type, severity;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP VIEW IF EXISTS public.preview_asset_incident_summary;`);
  pgm.dropConstraint('preview_asset_incidents', 'preview_asset_incidents_severity_check', { ifExists: true });
  pgm.dropTable('preview_asset_incidents', { ifExists: true });
};
