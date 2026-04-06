import { withTx } from "../db/tx";
import { findArtisanProfileIdByUserId } from "../repositories/artisan.byUser.repo";
import { findJobById } from "../repositories/job.read.repo";
import { updateJobStatusTx } from "../repositories/job.repo.tx";
import { JobRow } from "../repositories/job.repo";

export async function updateJobStatus(input: {
  jobId: string;
  artisanUserId: string;
  status: JobRow["status"];
}) {
  const artisanProfileId = await findArtisanProfileIdByUserId(input.artisanUserId);
  if (!artisanProfileId) {
    return { ok: false as const, status: 404, error: "Artisan profile not found" };
  }

  const job = await findJobById(input.jobId);
  if (!job) return { ok: false as const, status: 404, error: "Job not found" };

  // Only the assigned artisan can update these intermediate statuses
  if (job.assigned_artisan_id !== artisanProfileId) {
    return { ok: false as const, status: 403, error: "Not assigned artisan" };
  }

  // Allow transitions between active states
  const activeStatuses: JobRow["status"][] = ["accepted", "on_the_way", "in_progress"];
  if (!activeStatuses.includes(input.status)) {
    return { ok: false as const, status: 400, error: "Invalid status transition for this endpoint" };
  }

  const updated = await withTx(async (client) => {
    return updateJobStatusTx(client, { jobId: input.jobId, status: input.status });
  });

  return { ok: true as const, status: 200, data: updated };
}
