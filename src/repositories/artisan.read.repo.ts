import { query } from "../db/query";

export async function findArtisanProfileById(id: string) {
    const res = await query<{ id: string; user_id: string }>(
        `SELECT id, user_id FROM artisan_profiles WHERE id = $1`,
        [id]
    );
    return res.rows[0] ?? null;
}