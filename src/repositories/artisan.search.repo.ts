import { query } from "../db/query";

export type ArtisanSearchRow = {
    artisan_profile_id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    bio: string | null;
    years_of_experience: number;
}

export async function findArtisansBySkill(skillName: string) {
    const normalized = skillName.trim().toLowerCase();

    const res = await query<ArtisanSearchRow>(
        `
        SELECT
            ap.id AS artisan_profile_id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            ap.bio,
            ap.years_of_experience
        FROM artisan_profiles ap
        JOIN users u ON u.id = ap.user_id
        JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
        JOIN skills s ON s.id = ask.skill_id
        WHERE lower(trim(s.name)) = $1
        ORDER BY ap.years_of_experience DESC
        `,
        [normalized]
    );

    return res.rows;
}