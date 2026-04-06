import { QueryResultRow } from "pg";
import { pool } from "./pool";

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}