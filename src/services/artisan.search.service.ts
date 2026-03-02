import { countArtisanBySkill, findArtisansBySkill } from "../repositories/artisan.search.repo";

export async function searchArtisans(input: { skill: string; limit: number; offset: number }) {
  const [total, results] = await Promise.all([
    countArtisanBySkill(input.skill),
    findArtisansBySkill(input.skill, input.limit, input.offset),
  ]);

  return {total, results};
}