import { findJobById } from "../repositories/job.read.repo";
import { createRating } from "../repositories/rating.repo";

export async function rateJob(input: {
    jobId: string;
    customerId: string;
    rating: number;
    comment?: string;
}) {
    const job = await findJobById(input.jobId);
if (!job) return { ok: false as const, status: 404, error: "Job not found" };

if (job.status !== "completed") {
  return { ok: false as const, status: 400, error: "Job is not completed" };
}

if (job.customer_id !== input.customerId) {
  return { ok: false as const, status: 403, error: "Not job owner" };
}

if (!job.assigned_artisan_id) {
  return { ok: false as const, status: 400, error: "Job has no assigned artisan" };
}

try {
  const row = await createRating({
    jobId: input.jobId,
    customerId: input.customerId,
    artisanId: job.assigned_artisan_id, // ✅ derived, not from client
    rating: input.rating,
    comment: input.comment ?? null,
  });

  return { ok: true as const, status: 201, data: row };
} catch (err: any) {
  if (err?.code === "23505") {
    return { ok: false as const, status: 409, error: "Job already rated" };
  }
  throw err;
}
}