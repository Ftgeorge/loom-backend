import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";
import { insertPortfolioItem, linkPortfolioItemToRating, deletePortfolioItem } from "../repositories/artisan.portfolio.repo";
import { z } from "zod";

export const portfolioRouter = Router();

const portfolioItemSchema = z.object({
    imageUrl: z.string().url(),
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    ratingId: z.string().uuid().optional(),
});

/** POST /portfolio — Add a work showcase item */
portfolioRouter.post(
    "/",
    requireAuth,
    requireRole("artisan"),
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanByUserId(req.user!.id);
        if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

        const parsed = portfolioItemSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        }

        const item = await insertPortfolioItem({
            artisanProfileId: artisan.artisan_profile_id,
            imageUrl: parsed.data.imageUrl,
            title: parsed.data.title,
            description: parsed.data.description,
        });

        if (parsed.data.ratingId) {
            await linkPortfolioItemToRating(item.id, parsed.data.ratingId);
        }

        return res.status(201).json(item);
    })
);

/** DELETE /portfolio/:id — Remove a portfolio item */
portfolioRouter.delete(
    "/:id",
    requireAuth,
    requireRole("artisan"),
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanByUserId(req.user!.id);
        if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

        await deletePortfolioItem(String(req.params.id), artisan.artisan_profile_id);
        return res.status(204).send();
    })
);
