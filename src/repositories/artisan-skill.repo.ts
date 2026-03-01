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