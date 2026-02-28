import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Pooling is what helps you scale (many API requests, few DB connections)
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});