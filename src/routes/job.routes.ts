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

export const jobRouter = Router();

jobRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
    }

    const job = await createJobRequest(parsed.data);
    return res.status(201).json(job);
  })
);

jobRouter.get(
    "/:jobId/matches",
    asyncHandler(async (req, res) => {
        const jobId = req.params.jobId;
        const skill = req.query.skill;

        if (typeof skill !== "string" || skill.trim().length < 2 ) {
            return res.status(400).json({
                error: "skill query param is required, e.g. /jobs/:jobId/matches?skill=plumbing"
            });
        }
        const result  = await getJobMatches({ jobId, skill });

        if (!result.ok){
            return res.status(result.status).json({ error: result.error});
        }

        return res.status(result.status).json(result.data);
    })
);

jobRouter.post(
    "/:jobId/assign",
    asyncHandler(async (req,res) => {
        const parsed = assignJobSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({error: "Invalid body", details: parsed.error.flatten ()});
        }
        const jobId = req.params.jobId;

        const result = await assignJob({
            jobId,
            artisanProfileId: parsed.data.artisanProfileId,
        });

        if (!result.ok){
            return res.status(result.status).json({ error: result.error });
        }

        return res.status(result.status).json(result.data);
    })
);

jobRouter.post(
    "/:jobId/complete",
    asyncHandler(async (req ,res) => {
        const parsed = completeJobSchema.safeParse(req.body);
        if (!parsed.success){
        return res.status(400).json({error: "Invalid body", details: parsed.error.flatten() });
        }

        const result = await completeJob({
            jobId: req.params.jobId,
            artisanProfileId: parsed.data.artisanProfileId,
        });

        if (!result.ok) return res.status(result.status).json({error:result.error});
        return res.status(result.status).json(result.data);
    })
);

jobRouter.post(
    "/:jobId/rate",
    asyncHandler(async (req,res) => {
        const parsed = rateJobSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten ()});
        }

        const result = await rateJob({ jobId: req.params.jobId, ...parsed.data});

        if (!result.ok) return res.status(result.status).json({error: result.error});
        return res.status(result.status).json(result.data);
    })
);