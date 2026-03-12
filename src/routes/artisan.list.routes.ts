import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { findArtisanById, findArtisanByUserId, listArtisans } from "../repositories/artisan.list.repo";
import { findArtisanReviews } from "../repositories/review.repo";
import { findEarningsByArtisanProfileId, findTransactionsByArtisanId } from "../repositories/earnings.repo";
import { findPortfolioByArtisanId } from "../repositories/artisan.portfolio.repo";
import { searchArtisans } from "../services/artisan.search.service";

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
        const { city, state, area, lat, lng, interests } = req.query;
        
        const interestsArr = Array.isArray(interests) 
            ? interests as string[] 
            : (typeof interests === "string" ? [interests] : undefined);

        const artisans = await listArtisans({
            limit,
            offset,
            city: city as string,
            state: state as string,
            area: area as string,
            lat: lat ? Number(lat) : undefined,
            lng: lng ? Number(lng) : undefined,
            interests: interestsArr
        });
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
        const portfolio = await findPortfolioByArtisanId(artisan.artisan_profile_id);
        const reviews = await findArtisanReviews(artisan.artisan_profile_id);
        return res.json({ ...artisan, portfolio, reviews });
    })
);

// ─── GET /artisans/me/earnings ─────────────────────────────
artisanListRouter.get(
    "/me/earnings",
    requireAuth,
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanByUserId(req.user!.id);
        if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });

        const [earnings, transactions] = await Promise.all([
            findEarningsByArtisanProfileId(artisan.artisan_profile_id),
            findTransactionsByArtisanId(artisan.artisan_profile_id, 30)
        ]);

        return res.json({
            ...(earnings ?? {
                artisan_profile_id: artisan.artisan_profile_id,
                total_earned: "0",
                jobs_completed: 0,
                pending_payout: "0",
                total_withdrawn: "0",
            }),
            transactions
        });
    })
);

// ─── GET /artisans/search ──────────────────────────────────
artisanListRouter.get(
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
        const { city, state, area, lat, lng } = req.query;
        const { total, results } = await searchArtisans({ 
            skill, 
            limit, 
            offset,
            city: city as string,
            state: state as string,
            area: area as string,
            lat: lat ? Number(lat) : undefined,
            lng: lng ? Number(lng) : undefined
        });
        return res.json({ total, count: results.length, limit, offset, results });
    })
);

// ─── GET /artisans/:id ─────────────────────────────────────
artisanListRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const artisan = await findArtisanById(String(req.params.id));
        if (!artisan) return res.status(404).json({ error: "Artisan not found" });
        const reviews = await findArtisanReviews(String(req.params.id));
        const portfolio = await findPortfolioByArtisanId(String(req.params.id));
        return res.json({ ...artisan, reviews, portfolio });
    })
);
