import "dotenv/config";
import { pool } from "./pool";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function hasMigrationRun(filename: string) {
  const res = await pool.query(
    `SELECT 1 FROM _migrations WHERE filename = $1`,
    [filename]
  );
  return res.rowCount > 0;
}

async function markMigrationRun(filename: string) {
  await pool.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [filename]);
}

async function run() {
  await ensureMigrationsTable();

  const files = await glob("migrations/*.sql");
  files.sort(); // ensures 001, 002, 003 order

  for (const file of files) {
    const filename = path.basename(file);

    if (await hasMigrationRun(filename)) {
      continue;
    }

    const sql = await readFile(file, "utf-8");

    // Transaction: either the whole migration applies, or none of it.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      await markMigrationRun(filename);
      console.log(`✅ Applied ${filename}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`❌ Failed ${filename}`);
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});