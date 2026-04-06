import { withTx } from "../db/tx";
import { findArtisanProfileIdByUserId } from "../repositories/artisan.byUser.repo";
import { findJobById } from "../repositories/job.read.repo";
import { completeJobTx } from "../repositories/job.repo.tx";
import { createTransaction, upsertEarnings } from "../repositories/earnings.repo";

export async function completeJob(input: {
  jobId: string;
  artisanUserId: string;
}) {
  const artisanProfileId = await findArtisanProfileIdByUserId(input.artisanUserId);

  if (!artisanProfileId) {
    return { ok: false as const, status: 404, error: "Artisan profile not found" };
  }

  const job = await findJobById(input.jobId);
  if (!job) return { ok: false as const, status: 404, error: "Job not found" };

  if (job.status !== "assigned" && job.status !== "accepted" && job.status !== "on_the_way" && job.status !== "in_progress") {
    return { ok: false as const, status: 400, error: "Job is in a state that cannot be completed" };
  }

  if (job.assigned_artisan_id !== artisanProfileId) {
    return { ok: false as const, status: 403, error: "Not assigned artisan" };
  }

  const updated = await withTx(async (client) => {
    const jobRes = await completeJobTx(client, { jobId: input.jobId });
    
    // Record earnings logic
    const amount = Number(job.budget || 0);
    if (amount > 0) {
      await upsertEarnings({
        artisanProfileId,
        additionalEarned: amount,
        incrementJobs: true,
      });

      await createTransaction({
        artisanProfileId,
        amount,
        type: 'credit',
        description: `Payment for ${job.title}`,
        jobId: job.id
      });
    }

    return jobRes;
  });

  return { ok: true as const, status: 200, data: updated };
}