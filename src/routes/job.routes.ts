import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createJobSchema } from "../validators/job.validators";
import { createJobRequest } from "../services/job.service";
import { getJobMatches } from "../services/job.match.service";

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
)