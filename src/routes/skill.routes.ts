import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createSkillSchema } from "../validators/skill.validators";
import { createSkillIfNotExists } from "../services/skill.service";

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