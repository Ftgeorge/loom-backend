import { withTx } from "../db/tx";
import { findArtisanProfileIdByUserId } from "../repositories/artisan.byUser.repo";
import { findJobById } from "../repositories/job.read.repo";
import { completeJobTx } from "../repositories/job.repo.tx";

export async function completeJob(input: {
  jobId: string;
  artisanUserId: string; // <- from JWT (req.user.id)
}) {
  const artisanProfileId = await findArtisanProfileIdByUserId(input.artisanUserId);

  console.log("COMPLETE_JOB artisanUserId:", input.artisanUserId);
  console.log("COMPLETE_JOB artisanProfileId:", artisanProfileId);

  if (!artisanProfileId) {
    return { ok: false as const, status: 404, error: "Artisan profile not found" };
  }

  const job = await findJobById(input.jobId);
  if (!job) return { ok: false as const, status: 404, error: "Job not found" };

  if (job.status !== "assigned") {
    return { ok: false as const, status: 400, error: "Job is not assigned" };
  }

  if (job.assigned_artisan_id !== artisanProfileId) {
    return { ok: false as const, status: 403, error: "Not assigned artisan" };
  }

  const updated = await withTx(async (client) => {
    return completeJobTx(client, { jobId: input.jobId });
  });

  return { ok: true as const, status: 200, data: updated };
}