import { createSkill, findSkillByName } from "../repositories/skill.repo";

export async function createSkillIfNotExists(name: string) {
  const existing = await findSkillByName(name);
  if (existing) return existing;

  return createSkill(name);
}