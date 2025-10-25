import { describe, it, expect } from "vitest";
import { Client } from "pg";

const databaseUrl = process?.env?.DATABASE_URL as string | undefined;

// Skip if no DB URL provided
const maybe = databaseUrl ? describe : describe.skip;

maybe("RLS basics", () => {
  it("can select default organization as authenticated user (if auth available)", async () => {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      const res = await client.query("select count(*)::int as n from public.organizations");
      expect(res.rows[0].n).toBeGreaterThanOrEqual(1);
    } finally {
      await client.end();
    }
  });
});
