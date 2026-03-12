import { countArtisanBySkill, findArtisansBySkill } from "../repositories/artisan.search.repo";

export async function searchArtisans(input: { 
  skill: string; 
  limit: number; 
  offset: number;
  city?: string;
  state?: string;
  area?: string;
  lat?: number;
  lng?: number;
}) {
  const [total, results] = await Promise.all([
    countArtisanBySkill({ skill: input.skill, city: input.city, state: input.state, area: input.area }),
    findArtisansBySkill(input),
  ]);

  return {total, results};
}