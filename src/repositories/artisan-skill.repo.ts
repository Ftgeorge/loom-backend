import { query } from "../db/query";

export async function addSkillToArtisan(input: {
  artisanProfileId: string;
  skillId: string;
}) {
  await query(
    `INSERT INTO artisan_skills (artisan_profile_id, skill_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [input.artisanProfileId, input.skillId]
  );

  return { ok: true };
}

export async function removeSkillFromArtisan(input: {
  artisanProfileId: string;
  skillId: string;
}) {
  await query(
    `DELETE FROM artisan_skills
     WHERE artisan_profile_id = $1 AND skill_id = $2`,
    [input.artisanProfileId, input.skillId]
  );
  return { ok: true };
}

export async function listArtisanSkills(artisanProfileId: string) {
  const res = await query<{ skill_id: string; name: string }>(
    `SELECT s.id as skill_id, s.name
     FROM skills s
     JOIN artisan_skills ask ON ask.skill_id = s.id
     WHERE ask.artisan_profile_id = $1`,
    [artisanProfileId]
  );
  return res.rows;
}