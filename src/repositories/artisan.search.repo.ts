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
};

export async function findArtisansBySkill(skillName: string, limit: number, offset: number) {
  const normalized = skillName.trim().toLowerCase();

  const res = await query<ArtisanSearchRow>(
    `
    SELECT
      ap.id AS artisan_profile_id,
      u.first_name,
      u.last_name,
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
    GROUP BY ap.id, u.first_name, u.last_name, ap.bio, ap.years_of_experience
    ORDER BY avg_rating DESC, ratings_count DESC, ap.years_of_experience DESC
    LIMIT $2 OFFSET $3
    `,
    [normalized, limit, offset]
  );

  return res.rows;
}

export async function countArtisanBySkill(skillName: string) {
    const normalized = skillName.trim().toLowerCase();

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