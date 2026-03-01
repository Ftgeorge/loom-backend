import { createSkillIfNotExists } from "./skill.service";
import { addSkillToArtisan } from "../repositories/artisan-skill.repo";

export async function attachSkillToArtisan(input: {
  artisanProfileId: string;
  skillName: string;
}) {
  const skill = await createSkillIfNotExists(input.skillName);

  await addSkillToArtisan({
    artisanProfileId: input.artisanProfileId,
    skillId: skill.id,
  });

  return { skill };
}