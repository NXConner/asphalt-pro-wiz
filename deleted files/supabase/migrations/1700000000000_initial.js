/* eslint-disable */
/** @type {import('node-pg-migrate').MigrationBuilder} */

exports.up = (pgm) => {
  // Extensions
  pgm.createExtension('pgcrypto', { ifNotExists: true });
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createExtension('vector', { ifNotExists: true });

  // Roles
  pgm.createTable('roles', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Users
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'text', notNull: true, unique: true },
    full_name: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // User Roles
  pgm.createTable('user_roles', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    role_id: { type: 'integer', notNull: true, references: 'roles', onDelete: 'cascade' },
    granted_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('user_roles', 'user_roles_pk', { primaryKey: ['user_id', 'role_id'] });

  // Jobs
  pgm.createTable('jobs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    customer_address: { type: 'text' },
    created_by: { type: 'uuid', references: 'users', onDelete: 'set null' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Estimates
  pgm.createTable('estimates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    inputs: { type: 'jsonb', notNull: true },
    costs: { type: 'jsonb', notNull: true },
    total: { type: 'numeric', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Documents
  pgm.createTable('documents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', notNull: true, references: 'jobs', onDelete: 'cascade' },
    title: { type: 'text', notNull: true },
    content: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // RAG chunks (optional server-side storage)
  pgm.createTable('rag_chunks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    source: { type: 'text', notNull: true },
    title: { type: 'text' },
    text: { type: 'text', notNull: true },
    embedding: { type: 'vector(768)' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // RLS: enable (policies can be added in Supabase environment)
  for (const table of ['users', 'user_roles', 'roles', 'jobs', 'estimates', 'documents', 'rag_chunks']) {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
  }

  // Seed core roles
  pgm.sql(`
    INSERT INTO roles (name) VALUES
      ('viewer'),
      ('operator'),
      ('manager'),
      ('super_admin')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('rag_chunks');
  pgm.dropTable('documents');
  pgm.dropTable('estimates');
  pgm.dropTable('jobs');
  pgm.dropConstraint('user_roles', 'user_roles_pk', { ifExists: true });
  pgm.dropTable('user_roles');
  pgm.dropTable('users');
  pgm.dropTable('roles');
  pgm.sql('DROP EXTENSION IF EXISTS vector;');
  pgm.sql('DROP EXTENSION IF EXISTS uuid-ossp;');
  pgm.sql('DROP EXTENSION IF EXISTS pgcrypto;');
};