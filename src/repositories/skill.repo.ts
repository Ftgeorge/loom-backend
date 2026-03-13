import { query } from "../db/query";

export type SkillRow = {
  id: string;
  name: string;
  created_at: string;
};

export async function createSkill(name: string) {
  const normalized = name.trim();

  const res = await query<SkillRow>(
    `INSERT INTO skills (name)
     VALUES ($1)
     RETURNING id, name, created_at`,
    [normalized]
  );

  return res.rows[0];
}

export async function findSkillByName(name: string) {
  const normalized = name.trim().toLowerCase();

  const res = await query<SkillRow>(
    `SELECT id, name, created_at
     FROM skills
     WHERE lower(trim(name)) = $1`,
    [normalized]
  );

  return res.rows[0] ?? null;
}

export async function findAllSkills() {
  const res = await query<SkillRow>(
    `SELECT id, name, created_at
     FROM skills
     ORDER BY name ASC`
  );
  return res.rows;
}