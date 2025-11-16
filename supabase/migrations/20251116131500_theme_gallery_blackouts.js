/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const BLACKOUT_FEED_STATUS = ['active', 'inactive', 'error'];
const LITURGICAL_SEASONS = ['advent', 'christmas', 'lent', 'holy_week', 'easter', 'pentecost', 'ordinary_time'];

exports.up = (pgm) => {
  pgm.createTable('scheduler_blackout_feeds', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'cascade' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    source_url: { type: 'text', notNull: true },
    timezone: { type: 'text', notNull: true, default: 'America/New_York' },
    status: { type: 'text', notNull: true, default: 'active' },
    last_synced_at: { type: 'timestamptz' },
    error_message: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('scheduler_blackout_feeds', 'scheduler_blackout_feeds_status_check', {
    check: `status = ANY('{${BLACKOUT_FEED_STATUS.join(',')}}')`,
  });
  pgm.addConstraint('scheduler_blackout_feeds', 'scheduler_blackout_feeds_unique_org_name', {
    unique: ['org_id', 'name'],
  });
  pgm.createIndex('scheduler_blackout_feeds', ['org_id']);
  pgm.createIndex('scheduler_blackout_feeds', ['status']);

  pgm.createTable('scheduler_blackout_entries', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    feed_id: { type: 'uuid', notNull: true, references: 'public.scheduler_blackout_feeds', onDelete: 'cascade' },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'cascade' },
    starts_at: { type: 'timestamptz', notNull: true },
    ends_at: { type: 'timestamptz', notNull: true },
    summary: { type: 'text', notNull: true },
    details: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('scheduler_blackout_entries', ['feed_id']);
  pgm.createIndex('scheduler_blackout_entries', ['org_id']);
  pgm.createIndex('scheduler_blackout_entries', ['starts_at', 'ends_at']);

  pgm.createTable('liturgical_calendar_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'cascade' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    season: { type: 'text', notNull: true, default: 'ordinary_time' },
    title: { type: 'text', notNull: true },
    description: { type: 'text' },
    starts_on: { type: 'date', notNull: true },
    ends_on: { type: 'date', notNull: true },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    is_global: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('liturgical_calendar_events', 'liturgical_calendar_events_season_check', {
    check: `season = ANY('{${LITURGICAL_SEASONS.join(',')}}')`,
  });
  pgm.createIndex('liturgical_calendar_events', ['org_id']);
  pgm.createIndex('liturgical_calendar_events', ['season']);
  pgm.createIndex('liturgical_calendar_events', ['starts_on', 'ends_on']);

  pgm.createTable('theme_gallery_profiles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'cascade' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    theme_name: { type: 'text', notNull: true },
    wallpaper_id: { type: 'uuid', references: 'public.theme_wallpapers', onDelete: 'set null' },
    badges: { type: 'text[]', notNull: true, default: pgm.func('ARRAY[]::text[]') },
    tags: { type: 'text[]', notNull: true, default: pgm.func('ARRAY[]::text[]') },
    summary: { type: 'text', notNull: true },
    is_global: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('theme_gallery_profiles', ['org_id']);
  pgm.createIndex('theme_gallery_profiles', ['theme_name']);

  pgm.sql(`
    CREATE TRIGGER scheduler_blackout_feeds_set_updated_at
      BEFORE UPDATE ON scheduler_blackout_feeds
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER liturgical_calendar_events_set_updated_at
      BEFORE UPDATE ON liturgical_calendar_events
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER theme_gallery_profiles_set_updated_at
      BEFORE UPDATE ON theme_gallery_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);

  pgm.sql(`ALTER TABLE scheduler_blackout_feeds ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY scheduler_blackout_feeds_read ON scheduler_blackout_feeds
      FOR SELECT TO authenticated
      USING (
        org_id IS NULL
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = scheduler_blackout_feeds.org_id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY scheduler_blackout_feeds_write ON scheduler_blackout_feeds
      FOR ALL TO authenticated
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = scheduler_blackout_feeds.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('operator','manager','super_admin')
        )
      )
      WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = scheduler_blackout_feeds.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('operator','manager','super_admin')
        )
      );
  `);

  pgm.sql(`ALTER TABLE scheduler_blackout_entries ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY scheduler_blackout_entries_read ON scheduler_blackout_entries
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM scheduler_blackout_feeds f
          WHERE f.id = scheduler_blackout_entries.feed_id
            AND (
              f.org_id IS NULL
              OR EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = f.org_id
                  AND m.user_id = auth.uid()
              )
            )
        )
      );

    CREATE POLICY scheduler_blackout_entries_write ON scheduler_blackout_entries
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM scheduler_blackout_feeds f
          WHERE f.id = scheduler_blackout_entries.feed_id
            AND f.created_by = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM scheduler_blackout_feeds f
          WHERE f.id = scheduler_blackout_entries.feed_id
            AND f.created_by = auth.uid()
        )
      );
  `);

  pgm.sql(`ALTER TABLE liturgical_calendar_events ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY liturgical_calendar_events_read ON liturgical_calendar_events
      FOR SELECT TO authenticated
      USING (
        is_global
        OR org_id IS NULL
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = liturgical_calendar_events.org_id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY liturgical_calendar_events_write ON liturgical_calendar_events
      FOR ALL TO authenticated
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = liturgical_calendar_events.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      )
      WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = liturgical_calendar_events.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );
  `);

  pgm.sql(`ALTER TABLE theme_gallery_profiles ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY theme_gallery_profiles_read ON theme_gallery_profiles
      FOR SELECT TO authenticated
      USING (
        is_global
        OR org_id IS NULL
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = theme_gallery_profiles.org_id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY theme_gallery_profiles_write ON theme_gallery_profiles
      FOR ALL TO authenticated
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = theme_gallery_profiles.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      )
      WITH CHECK (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = theme_gallery_profiles.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP POLICY IF EXISTS theme_gallery_profiles_write ON theme_gallery_profiles;`);
  pgm.sql(`DROP POLICY IF EXISTS theme_gallery_profiles_read ON theme_gallery_profiles;`);
  pgm.sql(`ALTER TABLE theme_gallery_profiles DISABLE ROW LEVEL SECURITY;`);
  pgm.dropTable('theme_gallery_profiles');

  pgm.sql(`DROP POLICY IF EXISTS liturgical_calendar_events_write ON liturgical_calendar_events;`);
  pgm.sql(`DROP POLICY IF EXISTS liturgical_calendar_events_read ON liturgical_calendar_events;`);
  pgm.sql(`ALTER TABLE liturgical_calendar_events DISABLE ROW LEVEL SECURITY;`);
  pgm.dropTable('liturgical_calendar_events');

  pgm.sql(`DROP POLICY IF EXISTS scheduler_blackout_entries_write ON scheduler_blackout_entries;`);
  pgm.sql(`DROP POLICY IF EXISTS scheduler_blackout_entries_read ON scheduler_blackout_entries;`);
  pgm.sql(`ALTER TABLE scheduler_blackout_entries DISABLE ROW LEVEL SECURITY;`);
  pgm.dropTable('scheduler_blackout_entries');

  pgm.sql(`DROP POLICY IF EXISTS scheduler_blackout_feeds_write ON scheduler_blackout_feeds;`);
  pgm.sql(`DROP POLICY IF EXISTS scheduler_blackout_feeds_read ON scheduler_blackout_feeds;`);
  pgm.sql(`ALTER TABLE scheduler_blackout_feeds DISABLE ROW LEVEL SECURITY;`);
  pgm.dropTable('scheduler_blackout_feeds');
};

