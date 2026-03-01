import { findArtisansBySkill } from "../repositories/artisan.search.repo";

export async function searchArtisans(input: {skill: string}) {
    const results = await findArtisansBySkill(input.skill);
    return results;
}