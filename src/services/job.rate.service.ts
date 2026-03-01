import { findJobById } from "../repositories/job.read.repo";
import { createRating } from "../repositories/rating.repo";

export async function rateJob(input: {
    jobId: string;
    customerId: string;
    artisanProfileId: string;
    rating: number;
    comment?: string;
}) {
    const job = await findJobById(input.jobId);
    if (!job) return {ok:false as const, status: 404, error: "Job not found"};

    if (job.status !== "completed"){
        return {ok: false as const, status: 400, error: "Job is not completed"};
    }

    if (job.customer_id !== input.customerId) {
        return {ok: false as const, status: 403, error: "Not job owner"};
    }

    if (job.assigned_artisan_id !== input.artisanProfileId) {
        return {ok: false as const, status: 403, error: "Not assigned artisan"};
    }

    const ratingRow = await createRating({
        jobId: input.jobId,
        customerId: input.customerId,
        artisanId: input.artisanProfileId,
        rating: input.rating,
        comment: input.comment ?? null,
    });

    return {ok: true as const, status: 201, data:ratingRow};
}