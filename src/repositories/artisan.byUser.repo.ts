import { query } from "../db/query";

export async function findArtisanProfileIdByUserId(userId: string) {
  const res = await query<{ id: string }>(
    `SELECT id FROM artisan_profiles WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0]?.id ?? null;
}