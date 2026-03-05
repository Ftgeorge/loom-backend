import { pool } from "../db/pool";
import { query } from "../db/query";

export type ArtisanProfileRow = {
    id: string;
    user_id: string;
    bio: string | null;
    years_of_experience: number;
    created_at: string;
};

export async function createArtisanProfile(input: {
    userId: string;
    bio?: string | null;
    yearsOfExperience?: number | null;
}) {
    const res = await query<ArtisanProfileRow>(
        `INSERT INTO artisan_profiles (user_id, bio, years_of_experience)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, bio, years_of_experience, created_at`,
        [input.userId, input.bio ?? null, input.yearsOfExperience ?? 0]
    );
    return res.rows[0];
}

export async function updateArtisanProfileByUserId(
    userId: string,
    updates: Partial<{
        bio: string;
        years_of_experience: number;
    }>
) {
    const fields = Object.keys(updates);
    if (fields.length === 0) return null;

    const setClause = fields.map((fields, i)=> `${fields} = $${i + 1}`).join(", ");

    const values = fields.map((field) => (updates as any)[field]);

    const result = await pool.query(
        `
        UPDATE artisan_profiles
        SET ${setClause}
        WHERE user_id = $${fields.length + 1}
        RETURNING id, user_id, bio, years_of_experience
        `,
        [...values, userId]
    );

    return result.rows[0] ?? null;
}