import { query } from "../db/query";

export type ArtisanSearchRow = {
  artisan_profile_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  bio: string | null;
  years_of_experience: number;
  avg_rating: number;
  ratings_count: number;
  area: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
};

export async function findArtisansBySkill(params: {
    skill: string;
    limit: number;
    offset: number;
    city?: string;
    state?: string;
    area?: string;
    lat?: number;
    lng?: number;
}) {
  const { skill, limit, offset, city, state, area, lat, lng } = params;
  const normalized = skill.trim().toLowerCase();
  
  let scoreParts = ["0"];
  let values: any[] = [normalized, limit, offset];
  let placeholderIndex = 4;

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

  const scoreSql = `(${scoreParts.join(" + ")})`;
  let orderSql = `ORDER BY ${scoreSql} DESC, avg_rating DESC, ratings_count DESC, ap.years_of_experience DESC`;
  
  if (lat && lng) {
    orderSql = `ORDER BY (POWER(u.lat - $${placeholderIndex}, 2) + POWER(u.lng - $${placeholderIndex + 1}, 2)) ASC, ${scoreSql} DESC, avg_rating DESC`;
    values.push(lat, lng);
  }

  const res = await query<ArtisanSearchRow>(
    `
    SELECT
      ap.id AS artisan_profile_id,
      u.first_name,
      u.last_name,
      u.area,
      u.city,
      u.state,
      u.lat,
      u.lng,
      ap.bio,
      ap.years_of_experience,
      COALESCE(AVG(r.rating), 0)::float AS avg_rating,
      COUNT(r.id)::int AS ratings_count
    FROM artisan_profiles ap
    JOIN users u ON u.id = ap.user_id
    JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
    JOIN skills s ON s.id = ask.skill_id
    LEFT JOIN ratings r ON r.artisan_id = ap.id
    WHERE lower(trim(s.name)) = $1
    GROUP BY ap.id, u.first_name, u.last_name, u.area, u.city, u.state, u.lat, u.lng, ap.bio, ap.years_of_experience
    ${orderSql}
    LIMIT $2 OFFSET $3
    `,
    values
  );

  return res.rows;
}

export async function countArtisanBySkill(params: {
    skill: string;
    city?: string;
    state?: string;
    area?: string;
}) {
    const { skill } = params;
    const normalized = skill.trim().toLowerCase();

    const res = await query<{total: number}>(
        `
        SELECT COUNT(DISTINCT ap.id):: int AS total
        FROM artisan_profiles ap
        JOIN artisan_skills ask ON ask.artisan_profile_id = ap.id
        JOIN skills s ON s.id = ask.skill_id
        WHERE lower(trim(s.name)) = $1
        `,
        [normalized]
    );

    return res.rows[0]?.total ?? 0;
}