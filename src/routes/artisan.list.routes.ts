import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { findArtisanById, findArtisanByUserId, listArtisans } from "../repositories/artisan.list.repo";
import { findArtisanReviews } from "../repositories/review.repo";
import { findEarningsByArtisanProfileId } from "../repositories/earnings.repo";

function qInt(val: unknown, def: number, max: number): number {
    return Math.min(Math.max(Number(typeof val === "string" ? val : def) || def, 0), max);
}

export const artisanListRouter = Router();

// ─── GET /artisans ─────────────────────────────────────────
artisanListRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const limit = qInt(req.query.limit, 20, 50);
        const offset = qInt(req.query.offset, 0, 10000);
        const artisans = await listArtisans(limit, offset);
        return res.json({ count: artisans.length, limit, offset, results: artisans });
    })
);

// ─── GET /artisans/me/full ─────────────────────────────────
// IMPORTANT: Must come before /:id
artisanListRouter.get(
    "/me/full",
    requireAuth,
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanByUserId(req.user!.id);
        if (!artisan) return res.status(404).json({ error: "Artisan profile not found for this user" });
        return res.json(artisan);
    })
);

// ─── GET /artisans/me/earnings ─────────────────────────────
artisanListRouter.get(
    "/me/earnings",
    requireAuth,
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanByUserId(req.user!.id);
        if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

        const earnings = await findEarningsByArtisanProfileId(artisan.artisan_profile_id);

        return res.json(
            earnings ?? {
                artisan_profile_id: artisan.artisan_profile_id,
                total_earned: "0",
                jobs_completed: 0,
                pending_payout: "0",
                total_withdrawn: "0",
            }
        );
    })
);

// ─── GET /artisans/:id ─────────────────────────────────────
artisanListRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanById(String(req.params.id));
        if (!artisan) return res.status(404).json({ error: "Artisan not found" });
        const reviews = await findArtisanReviews(String(req.params.id));
        return res.json({ ...artisan, reviews });
    })
);
