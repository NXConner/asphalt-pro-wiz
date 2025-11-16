/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const THEME_TONES = ['dusk', 'aurora', 'ember', 'lagoon', 'stealth', 'command'];
const WALLPAPER_SOURCES = ['custom', 'system', 'synthesized'];

exports.up = (pgm) => {
  pgm.createTable('theme_wallpapers', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'cascade' },
    created_by: { type: 'uuid', references: 'auth.users', onDelete: 'set null' },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    data_url: { type: 'text', notNull: true },
    tone: { type: 'text', notNull: true, default: 'dusk' },
    source: { type: 'text', notNull: true, default: 'custom' },
    wallpaper_hash: { type: 'text', notNull: true },
    is_global: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('theme_wallpapers', 'theme_wallpapers_tone_check', {
    check: `tone = ANY('{${THEME_TONES.join(',')}}')`,
  });
  pgm.addConstraint('theme_wallpapers', 'theme_wallpapers_source_check', {
    check: `source = ANY('{${WALLPAPER_SOURCES.join(',')}}')`,
  });
  pgm.addConstraint('theme_wallpapers', 'theme_wallpapers_hash_unique', {
    unique: ['wallpaper_hash'],
  });
  pgm.createIndex('theme_wallpapers', 'org_id');
  pgm.createIndex('theme_wallpapers', 'created_by');

  pgm.createTable('theme_preferences', {
    user_id: { type: 'uuid', primaryKey: true, references: 'auth.users', onDelete: 'cascade' },
    org_id: { type: 'uuid', references: 'public.organizations', onDelete: 'set null' },
    theme_id: { type: 'text', notNull: true, default: 'theme-division-agent' },
    wallpaper_id: { type: 'uuid', references: 'theme_wallpapers', onDelete: 'set null' },
    palette: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    wallpaper_settings: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    hud_settings: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('theme_preferences', 'org_id');
  pgm.createIndex('theme_preferences', 'wallpaper_id');

  pgm.sql(`
    CREATE TRIGGER theme_wallpapers_set_updated_at
      BEFORE UPDATE ON theme_wallpapers
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    CREATE TRIGGER theme_preferences_set_updated_at
      BEFORE UPDATE ON theme_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);

  pgm.sql(`ALTER TABLE theme_wallpapers ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY theme_wallpapers_select ON theme_wallpapers
      FOR SELECT TO authenticated
      USING (
        is_global
        OR created_by = auth.uid()
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM user_org_memberships m
            WHERE m.org_id = theme_wallpapers.org_id
              AND m.user_id = auth.uid()
          )
        )
      );

    CREATE POLICY theme_wallpapers_insert ON theme_wallpapers
      FOR INSERT TO authenticated
      WITH CHECK (
        created_by = auth.uid()
        AND (
          org_id IS NULL
          OR EXISTS (
            SELECT 1 FROM user_org_memberships m
            WHERE m.org_id = theme_wallpapers.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('operator','manager','super_admin')
          )
        )
      );

    CREATE POLICY theme_wallpapers_update ON theme_wallpapers
      FOR UPDATE TO authenticated
      USING (
        created_by = auth.uid()
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM user_org_memberships m
            WHERE m.org_id = theme_wallpapers.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('manager','super_admin')
          )
        )
      )
      WITH CHECK (
        created_by = auth.uid()
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM user_org_memberships m
            WHERE m.org_id = theme_wallpapers.org_id
              AND m.user_id = auth.uid()
              AND m.role IN ('manager','super_admin')
          )
        )
      );

    CREATE POLICY theme_wallpapers_delete ON theme_wallpapers
      FOR DELETE TO authenticated
      USING (
        created_by = auth.uid()
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM user_org_memberships m
            WHERE m.org_id = theme_wallpapers.org_id
              AND m.user_id = auth.uid()
              AND m.role = 'super_admin'
          )
        )
      );
  `);

  pgm.sql(`ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY theme_preferences_self ON theme_preferences
      FOR ALL TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP POLICY IF EXISTS theme_preferences_self ON theme_preferences;
    DROP TABLE IF EXISTS theme_preferences;
  `);
  pgm.sql(`
    DROP POLICY IF EXISTS theme_wallpapers_delete ON theme_wallpapers;
    DROP POLICY IF EXISTS theme_wallpapers_update ON theme_wallpapers;
    DROP POLICY IF EXISTS theme_wallpapers_insert ON theme_wallpapers;
    DROP POLICY IF EXISTS theme_wallpapers_select ON theme_wallpapers;
    DROP TABLE IF EXISTS theme_wallpapers;
  `);
};
