import { query } from "../db/query";

export type ArtisanFullRow = {
    artisan_profile_id: string;
    user_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    bio: string | null;
    years_of_experience: number;
    avg_rating: number;
    ratings_count: number;
    skills: string[];
};

/** Get single artisan profile by artisan_profile_id */
export async function findArtisanById(id: string): Promise<ArtisanFullRow | null> {
    const res = await query<ArtisanFullRow>(
        `SELECT
            ap.id AS artisan_profile_id,
            u.id AS user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            ap.bio,
            ap.years_of_experience,
            COALESCE(AVG(r.rating), 0)::float AS avg_rating,
            COUNT(DISTINCT r.id)::int AS ratings_count,
            COALESCE(
                array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
                '{}'
            ) AS skills
         FROM artisan_profiles ap
         JOIN users u ON u.id = ap.user_id
         LEFT JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
         LEFT JOIN skills s ON s.id = ask.skill_id
         LEFT JOIN ratings r ON r.artisan_id = ap.id
         WHERE ap.id = $1
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, ap.bio, ap.years_of_experience`,
        [id]
    );
    return res.rows[0] ?? null;
}

/** Get artisan profile by user_id (for the logged-in artisan's own profile) */
export async function findArtisanByUserId(userId: string): Promise<ArtisanFullRow | null> {
    const res = await query<ArtisanFullRow>(
        `SELECT
            ap.id AS artisan_profile_id,
            u.id AS user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            ap.bio,
            ap.years_of_experience,
            COALESCE(AVG(r.rating), 0)::float AS avg_rating,
            COUNT(DISTINCT r.id)::int AS ratings_count,
            COALESCE(
                array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
                '{}'
            ) AS skills
         FROM artisan_profiles ap
         JOIN users u ON u.id = ap.user_id
         LEFT JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
         LEFT JOIN skills s ON s.id = ask.skill_id
         LEFT JOIN ratings r ON r.artisan_id = ap.id
         WHERE ap.user_id = $1
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, ap.bio, ap.years_of_experience`,
        [userId]
    );
    return res.rows[0] ?? null;
}

/** List artisans (no skill filter — for home/browse screens) */
export async function listArtisans(limit = 20, offset = 0): Promise<ArtisanFullRow[]> {
    const res = await query<ArtisanFullRow>(
        `SELECT
            ap.id AS artisan_profile_id,
            u.id AS user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            ap.bio,
            ap.years_of_experience,
            COALESCE(AVG(r.rating), 0)::float AS avg_rating,
            COUNT(DISTINCT r.id)::int AS ratings_count,
            COALESCE(
                array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
                '{}'
            ) AS skills
         FROM artisan_profiles ap
         JOIN users u ON u.id = ap.user_id
         LEFT JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
         LEFT JOIN skills s ON s.id = ask.skill_id
         LEFT JOIN ratings r ON r.artisan_id = ap.id
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, ap.bio, ap.years_of_experience
         ORDER BY avg_rating DESC, ap.years_of_experience DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return res.rows;
}
