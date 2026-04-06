import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createSkillSchema } from "../validators/skill.validators";
import { createSkillIfNotExists } from "../services/skill.service";
import { findAllSkills } from "../repositories/skill.repo";

export const skillRouter = Router();

skillRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }

    const skill = await createSkillIfNotExists(parsed.data.name);
    return res.status(201).json(skill);
  })
);

skillRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const skills = await findAllSkills();
    return res.json(skills);
  })
);