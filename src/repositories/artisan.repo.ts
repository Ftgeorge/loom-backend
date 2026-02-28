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