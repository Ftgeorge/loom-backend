import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { findJobByIdFull, findJobsByCustomerId, findOpenJobs, findJobsByArtisanId, countJobsByCustomerId } from "../repositories/job.list.repo";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";

/** Helper: safely parse a query param that may be string | string[] | undefined */
function qStr(val: unknown): string | undefined {
    return typeof val === "string" ? val : undefined;
}
function qInt(val: unknown, def: number, max: number): number {
    return Math.min(Math.max(Number(qStr(val)) || def, 0), max);
}

export const jobListRouter = Router();

// ─── GET /jobs ────────────────────────────────────────────
jobListRouter.get(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const status = qStr(req.query.status);
        const limit = qInt(req.query.limit, 20, 50);
        const offset = qInt(req.query.offset, 0, 10000);
        const role = req.user!.role;

        if (role === "customer") {
            const [jobs, total] = await Promise.all([
                findJobsByCustomerId(req.user!.id, status, limit, offset),
                countJobsByCustomerId(req.user!.id, status),
            ]);
            return res.json({ total, count: jobs.length, limit, offset, results: jobs });
        }

        if (role === "artisan") {
            const artisan = await findArtisanByUserId(req.user!.id);
            if (!artisan) {
                return res.status(404).json({ error: "Artisan profile not found" });
            }
            const openJobs = await findOpenJobs(limit, offset);
            const myJobs = await findJobsByArtisanId(artisan.artisan_profile_id, undefined, 10, 0);
            const myJobIds = new Set(myJobs.map((j) => j.id));
            const combined = [...myJobs, ...openJobs.filter((j) => !myJobIds.has(j.id))];
            return res.json({ total: combined.length, count: combined.length, limit, offset, results: combined });
        }

        return res.status(403).json({ error: "Role not recognised" });
    })
);

// ─── GET /jobs/:jobId ─────────────────────────────────────
jobListRouter.get(
    "/:jobId",
    requireAuth,
    asyncHandler(async (req, res) => {
        const job = await findJobByIdFull(String(req.params.jobId));
        if (!job) return res.status(404).json({ error: "Job not found" });

        if (req.user!.role === "customer" && job.customer_id !== req.user!.id) {
            return res.status(403).json({ error: "Not authorised" });
        }

        return res.json(job);
    })
);
