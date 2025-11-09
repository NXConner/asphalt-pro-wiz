/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const SUPPLIER_TABLE = 'material_suppliers';
const PRICING_TABLE = 'supplier_pricing_snapshots';

exports.up = (pgm) => {
  pgm.createTable(
    { schema: 'public', name: SUPPLIER_TABLE },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: {
        type: 'uuid',
        notNull: true,
        references: '"public"."organizations"',
        onDelete: 'cascade',
      },
      name: { type: 'text', notNull: true },
      slug: { type: 'text' },
      region: { type: 'text' },
      coverage_radius_miles: { type: 'numeric', default: 50 },
      lead_time_days: { type: 'integer', default: 2 },
      reliability_score: { type: 'numeric', default: 0.7 },
      primary_materials: { type: 'text[]', notNull: true, default: pgm.func("'{}'::text[]") },
      contact: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );

  pgm.createIndex({ schema: 'public', name: SUPPLIER_TABLE }, ['org_id', 'name'], {
    name: `${SUPPLIER_TABLE}_org_name_idx`,
    unique: true,
  });
  pgm.createIndex({ schema: 'public', name: SUPPLIER_TABLE }, ['org_id', 'region'], {
    name: `${SUPPLIER_TABLE}_org_region_idx`,
  });
  pgm.createIndex({ schema: 'public', name: SUPPLIER_TABLE }, ['org_id', 'coverage_radius_miles'], {
    name: `${SUPPLIER_TABLE}_coverage_radius_idx`,
  });
  pgm.addConstraint(
    { schema: 'public', name: SUPPLIER_TABLE },
    `${SUPPLIER_TABLE}_org_id_id_key`,
    { unique: ['org_id', 'id'] },
  );

  pgm.sql(`
    CREATE TRIGGER ${SUPPLIER_TABLE}_set_updated_at
      BEFORE UPDATE ON public.${SUPPLIER_TABLE}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER ${SUPPLIER_TABLE}_set_org
      BEFORE INSERT ON public.${SUPPLIER_TABLE}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
  `);

  pgm.sql(`ALTER TABLE public.${SUPPLIER_TABLE} ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY ${SUPPLIER_TABLE}_select ON public.${SUPPLIER_TABLE}
      FOR SELECT TO authenticated
      USING (public.user_is_member_of_org(org_id));
  `);
  pgm.sql(`
    CREATE POLICY ${SUPPLIER_TABLE}_insert ON public.${SUPPLIER_TABLE}
      FOR INSERT TO authenticated
      WITH CHECK (
        public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin'])
      );
  `);
  pgm.sql(`
    CREATE POLICY ${SUPPLIER_TABLE}_update ON public.${SUPPLIER_TABLE}
      FOR UPDATE TO authenticated
      USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']))
      WITH CHECK (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
  `);
  pgm.sql(`
    CREATE POLICY ${SUPPLIER_TABLE}_delete ON public.${SUPPLIER_TABLE}
      FOR DELETE TO authenticated
      USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
  `);

  pgm.createTable(
    { schema: 'public', name: PRICING_TABLE },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      org_id: {
        type: 'uuid',
        notNull: true,
        references: '"public"."organizations"',
        onDelete: 'cascade',
      },
      supplier_id: {
        type: 'uuid',
        notNull: true,
        references: `"public"."${SUPPLIER_TABLE}"`,
        onDelete: 'cascade',
      },
      material_type: { type: 'text', notNull: true },
      material_grade: { type: 'text' },
      unit_price: { type: 'numeric', notNull: true },
      unit_of_measure: { type: 'text', notNull: true, default: 'gallon' },
      currency: { type: 'text', notNull: true, default: 'USD' },
      effective_date: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      source: { type: 'text', default: 'manual' },
      confidence: { type: 'numeric', default: 0.6 },
      notes: { type: 'text' },
      metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      created_by: { type: 'uuid', references: '"auth"."users"', onDelete: 'set null' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
  );

  pgm.createIndex(
    { schema: 'public', name: PRICING_TABLE },
    ['org_id', 'material_type', 'effective_date DESC'],
    { name: `${PRICING_TABLE}_org_material_date_idx` },
  );
  pgm.createIndex(
    { schema: 'public', name: PRICING_TABLE },
    ['supplier_id', 'material_type', 'effective_date DESC'],
    { name: `${PRICING_TABLE}_supplier_material_date_idx` },
  );
  pgm.addConstraint(
    { schema: 'public', name: PRICING_TABLE },
    `${PRICING_TABLE}_unique_snapshot`,
    { unique: ['supplier_id', 'material_type', 'effective_date'] },
  );
  pgm.addConstraint(
    { schema: 'public', name: PRICING_TABLE },
    `${PRICING_TABLE}_org_supplier_fk`,
    {
      foreignKeys: {
        columns: ['org_id', 'supplier_id'],
        references: `"public"."${SUPPLIER_TABLE}"(org_id, id)`,
        onDelete: 'cascade',
      },
    },
  );

  pgm.sql(`
    CREATE TRIGGER ${PRICING_TABLE}_set_updated_at
      BEFORE UPDATE ON public.${PRICING_TABLE}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER ${PRICING_TABLE}_set_org
      BEFORE INSERT ON public.${PRICING_TABLE}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_org_and_created_by();
  `);

  pgm.sql(`ALTER TABLE public.${PRICING_TABLE} ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY ${PRICING_TABLE}_select ON public.${PRICING_TABLE}
      FOR SELECT TO authenticated
      USING (public.user_is_member_of_org(org_id));
  `);
  pgm.sql(`
    CREATE POLICY ${PRICING_TABLE}_insert ON public.${PRICING_TABLE}
      FOR INSERT TO authenticated
      WITH CHECK (
        public.user_has_org_role(COALESCE(org_id, public.current_user_default_org()), ARRAY['manager','super_admin'])
      );
  `);
  pgm.sql(`
    CREATE POLICY ${PRICING_TABLE}_update ON public.${PRICING_TABLE}
      FOR UPDATE TO authenticated
      USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']))
      WITH CHECK (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
  `);
  pgm.sql(`
    CREATE POLICY ${PRICING_TABLE}_delete ON public.${PRICING_TABLE}
      FOR DELETE TO authenticated
      USING (public.user_has_org_role(org_id, ARRAY['manager','super_admin']));
  `);

  pgm.sql(`
    CREATE OR REPLACE VIEW public.supplier_price_insights AS
    WITH ranked AS (
      SELECT
        s.org_id,
        s.id AS supplier_id,
        s.name AS supplier_name,
        s.lead_time_days,
        s.coverage_radius_miles,
        s.reliability_score,
        s.metadata AS supplier_metadata,
        s.contact AS supplier_contact,
        sp.material_type,
        sp.material_grade,
        sp.unit_price,
        sp.unit_of_measure,
        sp.currency,
        sp.effective_date,
        sp.confidence,
        sp.source,
        sp.metadata AS price_metadata,
        ROW_NUMBER() OVER (
          PARTITION BY sp.supplier_id, sp.material_type
          ORDER BY sp.effective_date DESC
        ) AS price_rank,
        (
          SELECT AVG(sub.unit_price)
          FROM public.${PRICING_TABLE} sub
          WHERE sub.supplier_id = sp.supplier_id
            AND sub.material_type = sp.material_type
            AND sub.effective_date >= sp.effective_date - INTERVAL '30 days'
        ) AS trailing_30_day_avg,
        (
          SELECT sub.unit_price
          FROM public.${PRICING_TABLE} sub
          WHERE sub.supplier_id = sp.supplier_id
            AND sub.material_type = sp.material_type
            AND sub.effective_date <= sp.effective_date - INTERVAL '7 days'
          ORDER BY sub.effective_date DESC
          LIMIT 1
        ) AS price_7_day_baseline,
        COUNT(*) OVER (PARTITION BY sp.supplier_id, sp.material_type) AS sample_count
      FROM public.${PRICING_TABLE} sp
      JOIN public.${SUPPLIER_TABLE} s
        ON s.id = sp.supplier_id
    )
    SELECT
      org_id,
      supplier_id,
      supplier_name,
      lead_time_days,
      coverage_radius_miles,
      reliability_score,
      supplier_metadata,
      supplier_contact,
      material_type,
      material_grade,
      unit_price,
      unit_of_measure,
      currency,
      effective_date,
      confidence,
      source,
      price_metadata,
      trailing_30_day_avg,
      price_7_day_baseline,
      sample_count
    FROM ranked
    WHERE price_rank = 1;
  `);
  pgm.sql(`ALTER VIEW public.supplier_price_insights SET (security_invoker = on);`);
};

exports.down = (pgm) => {
  pgm.sql(`DROP VIEW IF EXISTS public.supplier_price_insights;`);

  pgm.sql(`DROP POLICY IF EXISTS ${PRICING_TABLE}_delete ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${PRICING_TABLE}_update ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${PRICING_TABLE}_insert ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${PRICING_TABLE}_select ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${SUPPLIER_TABLE}_delete ON public.${SUPPLIER_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${SUPPLIER_TABLE}_update ON public.${SUPPLIER_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${SUPPLIER_TABLE}_insert ON public.${SUPPLIER_TABLE};`);
  pgm.sql(`DROP POLICY IF EXISTS ${SUPPLIER_TABLE}_select ON public.${SUPPLIER_TABLE};`);

  pgm.sql(`DROP TRIGGER IF EXISTS ${PRICING_TABLE}_set_org ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP TRIGGER IF EXISTS ${PRICING_TABLE}_set_updated_at ON public.${PRICING_TABLE};`);
  pgm.sql(`DROP TRIGGER IF EXISTS ${SUPPLIER_TABLE}_set_org ON public.${SUPPLIER_TABLE};`);
  pgm.sql(`DROP TRIGGER IF EXISTS ${SUPPLIER_TABLE}_set_updated_at ON public.${SUPPLIER_TABLE};`);

  pgm.dropConstraint({ schema: 'public', name: PRICING_TABLE }, `${PRICING_TABLE}_org_supplier_fk`, {
    ifExists: true,
  });
  pgm.dropConstraint({ schema: 'public', name: PRICING_TABLE }, `${PRICING_TABLE}_unique_snapshot`, {
    ifExists: true,
  });

  pgm.dropIndex({ schema: 'public', name: PRICING_TABLE }, `${PRICING_TABLE}_supplier_material_date_idx`, {
    ifExists: true,
  });
  pgm.dropIndex({ schema: 'public', name: PRICING_TABLE }, `${PRICING_TABLE}_org_material_date_idx`, {
    ifExists: true,
  });
  pgm.dropTable({ schema: 'public', name: PRICING_TABLE }, { ifExists: true });

  pgm.dropConstraint({ schema: 'public', name: SUPPLIER_TABLE }, `${SUPPLIER_TABLE}_org_id_id_key`, {
    ifExists: true,
  });
  pgm.dropIndex({ schema: 'public', name: SUPPLIER_TABLE }, `${SUPPLIER_TABLE}_coverage_radius_idx`, {
    ifExists: true,
  });
  pgm.dropIndex({ schema: 'public', name: SUPPLIER_TABLE }, `${SUPPLIER_TABLE}_org_region_idx`, {
    ifExists: true,
  });
  pgm.dropIndex({ schema: 'public', name: SUPPLIER_TABLE }, `${SUPPLIER_TABLE}_org_name_idx`, {
    ifExists: true,
  });
  pgm.dropTable({ schema: 'public', name: SUPPLIER_TABLE }, { ifExists: true });
};
