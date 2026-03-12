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
    base_fee: number;
    price_per_hour: number | null;
    avg_rating: number;
    ratings_count: number;
    skills: string[];
    area: string | null;
    city: string | null;
    state: string | null;
    lat: number | null;
    lng: number | null;
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
            u.area,
            u.city,
            u.state,
            u.lat,
            u.lng,
            ap.bio,
            ap.years_of_experience,
            ap.base_fee,
            ap.price_per_hour,
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
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, u.area, u.city, u.state, u.lat, u.lng, ap.bio, ap.years_of_experience, ap.base_fee, ap.price_per_hour`,
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
            u.area,
            u.city,
            u.state,
            u.lat,
            u.lng,
            ap.bio,
            ap.years_of_experience,
            ap.base_fee,
            ap.price_per_hour,
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
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, u.area, u.city, u.state, u.lat, u.lng, ap.bio, ap.years_of_experience, ap.base_fee, ap.price_per_hour`,
        [userId]
    );
    return res.rows[0] ?? null;
}

/** List artisans (no skill filter — for home/browse screens) */
export async function listArtisans(params: {
    limit?: number;
    offset?: number;
    city?: string;
    state?: string;
    area?: string;
    lat?: number;
    lng?: number;
    interests?: string[];
}): Promise<ArtisanFullRow[]> {
    const { limit = 20, offset = 0, city, state, area, lat, lng, interests } = params;
    
    let values: any[] = [limit, offset];
    let placeholderIndex = 3;

    // We prioritize location and interests.
    let scoreParts = ["0"];
    if (area) {
        scoreParts.push(`(CASE WHEN u.area ILIKE $${placeholderIndex++} THEN 100 ELSE 0 END)`);
        values.push(area);
    }
    if (city) {
        scoreParts.push(`(CASE WHEN u.city ILIKE $${placeholderIndex++} THEN 40 ELSE 0 END)`);
        values.push(city);
    }
    if (state) {
        scoreParts.push(`(CASE WHEN u.state ILIKE $${placeholderIndex++} THEN 10 ELSE 0 END)`);
        values.push(state);
    }
    if (interests && interests.length > 0) {
        // Boost if artisan has any of the user's interests
        scoreParts.push(`(CASE WHEN EXISTS (
            SELECT 1 FROM artisan_skills mask 
            JOIN skills ms ON ms.id = mask.skill_id 
            WHERE mask.artisan_profile_id = ap.id 
            AND lower(ms.name) = ANY($${placeholderIndex++})
        ) THEN 200 ELSE 0 END)`);
        values.push(interests.map(i => i.toLowerCase()));
    }

    const scoreSql = `(${scoreParts.join(" + ")})`;
    
    let orderSql = `ORDER BY ${scoreSql} DESC, avg_rating DESC, ap.years_of_experience DESC`;
    
    // Proximity ordering if lat/lng are provided (highest priority)
    if (lat && lng) {
        orderSql = `ORDER BY (POWER(u.lat - $${placeholderIndex}, 2) + POWER(u.lng - $${placeholderIndex + 1}, 2)) ASC, ${scoreSql} DESC, avg_rating DESC`;
        values.push(lat, lng);
    }

    const res = await query<ArtisanFullRow>(
        `SELECT
            ap.id AS artisan_profile_id,
            u.id AS user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            u.area,
            u.city,
            u.state,
            u.lat,
            u.lng,
            ap.bio,
            ap.years_of_experience,
            ap.base_fee,
            ap.price_per_hour,
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
         GROUP BY ap.id, u.id, u.email, u.first_name, u.last_name, u.phone, u.area, u.city, u.state, u.lat, u.lng, ap.bio, ap.years_of_experience, ap.base_fee, ap.price_per_hour
         ${orderSql}
         LIMIT $1 OFFSET $2`,
        values
    );
    return res.rows;
}
