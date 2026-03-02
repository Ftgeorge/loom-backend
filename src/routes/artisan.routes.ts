import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { registerArtisan } from "../services/artisan.service";
import { addArtisanSkillSchema } from "../validators/skill.validators";
import { attachSkillToArtisan } from "../services/artisan-skill.service";
import { artisanRegisterSchema } from "../validators/artisan.validator";
import { searchArtisans } from "../services/artisan.search.service";

export const artisanRouter = Router();

artisanRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = artisanRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const result = await registerArtisan(parsed.data);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  })
);

artisanRouter.post(
  "/:artisanProfileId/skills",
  asyncHandler(async (req, res) => {
    const parsed = addArtisanSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }

    const artisanProfileId = req.params.artisanProfileId;
    const result = await attachSkillToArtisan({
      artisanProfileId,
      skillName: parsed.data.skillName,
    });

    return res.status(201).json(result);
  })
);

artisanRouter.get(
    "/search",
    asyncHandler(async (req, res) => {
        const skill = req.query.skill;

        if (typeof skill !== "string" || skill.trim().length < 2) {
            return res.status(400).json({
                error: "skill query param is required, e.g. /artisans/search?skill=plumbing",
            });
        }
        
        const limitRaw = req.query.limit;
        const offsetRaw = req.query.offset;
        const limit =
        typeof limitRaw === "string"
            ? Math.min(Math.max(Number(limitRaw) || 20, 1), 50)
            : 20;

        const offset =
        typeof offsetRaw === "string"
            ? Math.max(Number(offsetRaw) || 0, 0)
            : 0;
        const {total, results} = await searchArtisans({skill, limit, offset});
        return res.json({ total, count: results.length, limit, offset, results});
    })
);