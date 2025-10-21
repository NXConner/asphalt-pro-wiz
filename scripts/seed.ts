#!/usr/bin/env tsx
import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const adminEmail = process.env.ADMIN_EMAIL || 'n8ter8@gmail.com';

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure core roles
    await client.query(`
      INSERT INTO roles (name) VALUES
        ('viewer'), ('operator'), ('manager'), ('super_admin')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Ensure admin user exists
    await client.query(
      `INSERT INTO users (email, full_name)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING;`,
      [adminEmail, 'Administrator']
    );

    const { rows: userRows } = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    if (userRows.length) {
      const userId = userRows[0].id;
      const { rows: roleRows } = await client.query<{ id: number }>(
        "SELECT id FROM roles WHERE name = 'super_admin'"
      );
      if (roleRows.length) {
        const roleId = roleRows[0].id;
        await client.query(
          `INSERT INTO user_roles (user_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, role_id) DO NOTHING;`,
          [userId, roleId]
        );
      }
    }

    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Seed completed.');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
