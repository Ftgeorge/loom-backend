import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { completeJobSchema, createJobSchema } from "../validators/job.validators";
import { createJobRequest } from "../services/job.service";
import { getJobMatches } from "../services/job.match.service";
import { assignJobSchema } from "../validators/job.validators";
import { assignJob } from "../services/job.assign.service";
import { completeJob } from "../services/job.complete.service";
import { rateJobSchema } from "../validators/job.validators";
import { rateJob } from "../services/job.rate.service";
import { cancelJob } from "../services/job.cancel.service";
import { acceptJob } from "../services/job.accept.service";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";

export const jobRouter = Router();

jobRouter.post(
  "/",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }
    console.log("AUTH USER:", req.user);
    const job = await createJobRequest({
      customerId: req.user!.id,
      title: parsed.data.title || parsed.data.skill || "New Job Request",
      description: parsed.data.description,
      location: parsed.data.location,
      budget: parsed.data.budget,
      urgency: parsed.data.urgency,
    });

    return res.status(201).json(job);
  })
)

jobRouter.get(
  "/:jobId/matches",
  asyncHandler(async (req, res) => {
    const jobId = req.params.jobId;
    const skill = req.query.skill;

    if (typeof skill !== "string" || skill.trim().length < 2) {
      return res.status(400).json({
        error: "skill query param is required, e.g. /jobs/:jobId/matches?skill=plumbing"
      });
    }
    const result = await getJobMatches({ jobId: String(jobId), skill });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  })
);

jobRouter.post(
  "/:jobId/assign",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const parsed = assignJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }
    const jobId = req.params.jobId;

    const result = await assignJob({
      jobId: String(jobId),
      customerId: req.user!.id,
      artisanProfileId: parsed.data.artisanProfileId,
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  })
);

jobRouter.post(
  "/:jobId/complete",
  requireAuth,
  requireRole("artisan"),
  asyncHandler(async (req, res) => {
    const result = await completeJob({
      jobId: String(req.params.jobId),
      artisanUserId: req.user!.id,
    });

    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  })
);

jobRouter.post(
  "/:jobId/rate",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const parsed = rateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    }

    const result = await rateJob({
      jobId: String(req.params.jobId),
      customerId: req.user!.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  })
);

// ─── POST /jobs/:jobId/cancel ───────────────────────────
jobRouter.post(
  "/:jobId/cancel",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const result = await cancelJob({
      jobId: String(req.params.jobId),
      customerId: req.user!.id,
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  })
);

// ─── POST /jobs/:jobId/accept ────────────────────────────
jobRouter.post(
  "/:jobId/accept",
  requireAuth,
  requireRole("artisan"),
  asyncHandler(async (req, res) => {
    const result = await acceptJob({
      jobId: String(req.params.jobId),
      artisanUserId: req.user!.id,
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  })
);
