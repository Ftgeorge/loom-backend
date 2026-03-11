import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { registerArtisan } from "../services/artisan.service";
import { addArtisanSkillSchema } from "../validators/skill.validators";
import { attachSkillToArtisan } from "../services/artisan-skill.service";
import { artisanRegisterSchema, updateArtisanSchema } from "../validators/artisan.validator";
import { searchArtisans } from "../services/artisan.search.service";
import { updateArtisan } from "../services/artisan.update.service";
import { upgradeToArtisan } from "../services/artisan.upgrade.service";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

export const artisanRouter = Router();

// ─── POST /artisans/me/profile ───────────────────────────
// For already registered users that now want a professional profile.
artisanRouter.post(
  "/me/profile",
  requireAuth,
  requireRole("artisan"),
  asyncHandler(async (req, res) => {
    // Basic onboarding usually doesn't have a lot of fields initially.
    const result = await upgradeToArtisan({
      userId: req.user!.id,
      bio: req.body.bio,
      yearsOfExperience: req.body.yearsOfExperience,
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  })
);

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

    const artisanProfileId = String(req.params.artisanProfileId);
    const result = await attachSkillToArtisan({
      artisanProfileId,
      skillName: parsed.data.skillName,
    });

    return res.status(201).json(result);
  })
);


artisanRouter.patch(
  "/me",
  requireAuth,
  requireRole("artisan"),
  asyncHandler(async (req, res) => {
    const parsed = updateArtisanSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
    }

    const result = await updateArtisan({
      userId: req.user!.id,
      updates: parsed.data,
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  })
);