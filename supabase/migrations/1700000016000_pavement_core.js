/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

const ROLES = ["viewer", "operator", "manager", "super_admin"];

exports.up = (pgm) => {
  // Clean up legacy placeholder tables if they exist
  pgm.sql(`
    DROP TABLE IF EXISTS public.rag_chunks CASCADE;
    DROP TABLE IF EXISTS public.documents CASCADE;
    DROP TABLE IF EXISTS public.estimates CASCADE;
    DROP TABLE IF EXISTS public.jobs CASCADE;
  `);

  pgm.sql(`DROP TYPE IF EXISTS public.job_status;`);
  pgm.createType("job_status", [
    "draft",
    "need_estimate",
    "estimated",
    "scheduled",
    "completed",
    "lost",
  ]);

  // Core organization + membership
  pgm.createTable("organizations", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    slug: { type: "text", notNull: true, unique: true },
    name: { type: "text", notNull: true },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("user_org_memberships", {
    user_id: { type: "uuid", notNull: true, references: "auth.users", onDelete: "cascade" },
    org_id: { type: "uuid", notNull: true, references: "organizations", onDelete: "cascade" },
    role: { type: "text", notNull: true },
    joined_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("user_org_memberships", "user_org_memberships_pk", {
    primaryKey: ["user_id", "org_id"],
  });
  pgm.addConstraint("user_org_memberships", "user_org_memberships_role_check", {
    check: `role = ANY('{${ROLES.join(",")}}')`,
  });

  // Jobs + derived data
  pgm.createTable("jobs", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    org_id: { type: "uuid", notNull: true, references: "organizations", onDelete: "cascade" },
    name: { type: "text", notNull: true },
    customer_name: { type: "text" },
    customer_address: { type: "text" },
    customer_latitude: { type: "double precision" },
    customer_longitude: { type: "double precision" },
    status: { type: "job_status", notNull: true, default: "need_estimate" },
    total_area_sqft: { type: "numeric" },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("jobs", "org_id");
  pgm.createIndex("jobs", "status");

  pgm.createTable("job_events", {
    id: { type: "bigserial", primaryKey: true },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    event_type: { type: "text", notNull: true },
    payload: { type: "jsonb" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
  });
  pgm.createIndex("job_events", "job_id");

  // Estimates
  pgm.createTable("estimates", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    prepared_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    inputs: { type: "jsonb", notNull: true },
    costs: { type: "jsonb", notNull: true },
    subtotal: { type: "numeric", notNull: true },
    overhead: { type: "numeric", notNull: true },
    profit: { type: "numeric", notNull: true },
    total: { type: "numeric", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("estimates", "job_id");

  pgm.createTable("estimate_line_items", {
    id: { type: "bigserial", primaryKey: true },
    estimate_id: { type: "uuid", notNull: true, references: "estimates", onDelete: "cascade" },
    kind: { type: "text", notNull: true },
    label: { type: "text", notNull: true },
    amount: { type: "numeric", notNull: true },
    metadata: { type: "jsonb" },
  });
  pgm.createIndex("estimate_line_items", "estimate_id");

  // Supporting content
  pgm.createTable("job_documents", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    title: { type: "text", notNull: true },
    kind: { type: "text", notNull: true },
    content: { type: "jsonb" },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("job_documents", "job_id");

  pgm.createTable("job_uploads", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    file_name: { type: "text", notNull: true },
    file_type: { type: "text", notNull: true },
    file_size: { type: "integer", notNull: true },
    storage_path: { type: "text", notNull: true },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("job_uploads", "job_id");

  pgm.createTable("job_receipts", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    category: { type: "text", notNull: true },
    vendor: { type: "text" },
    amount: { type: "numeric", notNull: true },
    incurred_on: { type: "date", notNull: true },
    notes: { type: "text" },
    file_id: { type: "uuid", references: "job_uploads", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("job_receipts", "job_id");

  // Premium services catalog + selections
  pgm.createTable("premium_services_catalog", {
    id: { type: "text", primaryKey: true },
    name: { type: "text", notNull: true },
    description: { type: "text" },
    unit_type: { type: "text", notNull: true },
    default_price: { type: "numeric", notNull: true },
  });

  pgm.createTable("job_premium_services", {
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    service_id: { type: "text", notNull: true, references: "premium_services_catalog", onDelete: "cascade" },
    enabled: { type: "boolean", notNull: true, default: true },
    price_override: { type: "numeric" },
    metadata: { type: "jsonb" },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("job_premium_services", "job_premium_services_pk", {
    primaryKey: ["job_id", "service_id"],
  });

  // Scheduler data
  pgm.createTable("crew_blackouts", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    org_id: { type: "uuid", notNull: true, references: "organizations", onDelete: "cascade" },
    starts_at: { type: "timestamptz", notNull: true },
    ends_at: { type: "timestamptz", notNull: true },
    reason: { type: "text" },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("crew_blackouts", "org_id");

  pgm.createTable("crew_assignments", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    job_id: { type: "uuid", notNull: true, references: "jobs", onDelete: "cascade" },
    crew_name: { type: "text", notNull: true },
    shift_start: { type: "timestamptz", notNull: true },
    shift_end: { type: "timestamptz", notNull: true },
    notes: { type: "text" },
    created_by: { type: "uuid", references: "auth.users", onDelete: "set null" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("crew_assignments", "job_id");

  // Seed premium catalog + ensure roles table holds expected values
  pgm.sql(
    pgm.asString(
      `insert into premium_services_catalog (id, name, description, unit_type, default_price) values
        ('edge-pushing','Edge Pushing','Restore crisp asphalt edges before sealing','flat',150),
        ('weed-killer','Vegetation Control','Herbicide treatment for cracks and perimeters','flat',75),
        ('crack-cleaning','Crack Cleaning','Heat-lance cleaning for optimal bond','flat',100),
        ('power-washing','Power Washing','High-pressure surface prep for heavy contamination','flat',200),
        ('debris-removal','Debris Removal','Haul off debris and spoils from site','flat',125)
      on conflict (id) do update set name = excluded.name, description = excluded.description, default_price = excluded.default_price;`.replace(/\n+/g, " ")
    )
  );

  pgm.sql(
    `INSERT INTO roles(name)
       SELECT value
       FROM unnest(ARRAY['viewer','operator','manager','super_admin']) AS value
       ON CONFLICT (name) DO NOTHING;`
  );

  // Enable RLS and create policies helper
  pgm.sql(`ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY organizations_select ON organizations
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY organizations_insert ON organizations
      FOR INSERT TO authenticated
      WITH CHECK (created_by = auth.uid());

    CREATE POLICY organizations_update ON organizations
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );

    CREATE POLICY organizations_delete ON organizations
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = organizations.id
            AND m.user_id = auth.uid()
            AND m.role = 'super_admin'
        )
      );
  `);

  pgm.sql(`ALTER TABLE user_org_memberships ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY user_org_memberships_select ON user_org_memberships
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = user_org_memberships.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );

    CREATE POLICY user_org_memberships_modify ON user_org_memberships
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = user_org_memberships.org_id
            AND m.user_id = auth.uid()
            AND m.role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = user_org_memberships.org_id
            AND m.user_id = auth.uid()
            AND m.role = 'super_admin'
        )
      );
  `);
  pgm.sql(`ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY jobs_select ON jobs
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY jobs_insert ON jobs
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = NEW.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('operator','manager','super_admin')
        )
      );

    CREATE POLICY jobs_update ON jobs
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = NEW.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );

    CREATE POLICY jobs_delete ON jobs
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = jobs.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );
  `);

  const jobScopedTables = [
    "job_events",
    "estimates",
    "job_documents",
    "job_uploads",
    "job_receipts",
    "job_premium_services",
    "crew_assignments",
  ];

  jobScopedTables.forEach((table) => {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY ${table}_select ON ${table}
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = ${table}.job_id
              AND EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
              )
          )
        );

      CREATE POLICY ${table}_insert ON ${table}
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = NEW.job_id
              AND EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('operator','manager','super_admin')
              )
          )
        );

      CREATE POLICY ${table}_update ON ${table}
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = ${table}.job_id
              AND EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = NEW.job_id
              AND EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        );

      CREATE POLICY ${table}_delete ON ${table}
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM jobs j
            WHERE j.id = ${table}.job_id
              AND EXISTS (
                SELECT 1 FROM user_org_memberships m
                WHERE m.org_id = j.org_id
                  AND m.user_id = auth.uid()
                  AND m.role IN ('manager','super_admin')
              )
          )
        );
    `);
  });

  pgm.sql(`ALTER TABLE crew_blackouts ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY crew_blackouts_select ON crew_blackouts
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = crew_blackouts.org_id
            AND m.user_id = auth.uid()
        )
      );

    CREATE POLICY crew_blackouts_insert ON crew_blackouts
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = NEW.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('operator','manager','super_admin')
        )
      );

    CREATE POLICY crew_blackouts_update ON crew_blackouts
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = crew_blackouts.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = NEW.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );

    CREATE POLICY crew_blackouts_delete ON crew_blackouts
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_org_memberships m
          WHERE m.org_id = crew_blackouts.org_id
            AND m.user_id = auth.uid()
            AND m.role IN ('manager','super_admin')
        )
      );
  `);

  pgm.sql(`ALTER TABLE estimate_line_items ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`
    CREATE POLICY estimate_line_items_select ON estimate_line_items
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM estimates e
          JOIN jobs j ON j.id = e.job_id
          WHERE e.id = estimate_line_items.estimate_id
            AND EXISTS (
              SELECT 1 FROM user_org_memberships m
              WHERE m.org_id = j.org_id
                AND m.user_id = auth.uid()
            )
        )
      );

    CREATE POLICY estimate_line_items_insert ON estimate_line_items
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM estimates e
          JOIN jobs j ON j.id = e.job_id
          WHERE e.id = NEW.estimate_id
            AND EXISTS (
              SELECT 1 FROM user_org_memberships m
              WHERE m.org_id = j.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('operator','manager','super_admin')
            )
        )
      );

    CREATE POLICY estimate_line_items_update ON estimate_line_items
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM estimates e
          JOIN jobs j ON j.id = e.job_id
          WHERE e.id = estimate_line_items.estimate_id
            AND EXISTS (
              SELECT 1 FROM user_org_memberships m
              WHERE m.org_id = j.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('manager','super_admin')
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM estimates e
          JOIN jobs j ON j.id = e.job_id
          WHERE e.id = NEW.estimate_id
            AND EXISTS (
              SELECT 1 FROM user_org_memberships m
              WHERE m.org_id = j.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('manager','super_admin')
            )
        )
      );

    CREATE POLICY estimate_line_items_delete ON estimate_line_items
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM estimates e
          JOIN jobs j ON j.id = e.job_id
          WHERE e.id = estimate_line_items.estimate_id
            AND EXISTS (
              SELECT 1 FROM user_org_memberships m
              WHERE m.org_id = j.org_id
                AND m.user_id = auth.uid()
                AND m.role IN ('manager','super_admin')
            )
        )
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS crew_assignments CASCADE;
    DROP TABLE IF EXISTS crew_blackouts CASCADE;
    DROP TABLE IF EXISTS job_premium_services CASCADE;
    DROP TABLE IF EXISTS premium_services_catalog CASCADE;
    DROP TABLE IF EXISTS job_receipts CASCADE;
    DROP TABLE IF EXISTS job_uploads CASCADE;
    DROP TABLE IF EXISTS job_documents CASCADE;
    DROP TABLE IF EXISTS estimate_line_items CASCADE;
    DROP TABLE IF EXISTS estimates CASCADE;
    DROP TABLE IF EXISTS job_events CASCADE;
    DROP TABLE IF EXISTS jobs CASCADE;
    DROP TABLE IF EXISTS user_org_memberships CASCADE;
    DROP TABLE IF EXISTS organizations CASCADE;
  `);

  pgm.sql(`DROP TYPE IF EXISTS job_status;`);
};
