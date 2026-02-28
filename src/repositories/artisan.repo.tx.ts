import type { Pool, PoolClient } from "pg";
import { ArtisanProfileRow } from "./artisan.repo";

export async function createArtisanProfileTx(
    client: PoolClient,
    input: { userId: string; bio?: string | null; yearsOfExperience?: number | null}
) {
    const res = await client.query<ArtisanProfileRow>(
        `INSERT INTO artisan_profiles (user_id, bio, years_of_experience)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, bio, years_of_experience`,
        [
            input.userId,
            input.bio ?? null,
            input.yearsOfExperience ?? null,
        ]
    );
    return res.rows[0];
}