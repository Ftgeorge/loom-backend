import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(2),
});

export const addArtisanSkillSchema = z.object({
  skillName: z.string().min(2),
});