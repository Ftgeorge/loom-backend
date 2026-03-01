import { withTx } from "../db/tx";
import { findJobById } from "../repositories/job.read.repo";
import { completeJobTx } from "../repositories/job.repo.tx";

export async function completeJob(input: {
    jobId: string;
    artisanProfileId: string;
}) {
    const job = await findJobById(input.jobId);
    if (!job) return {ok: false as const, status: 404, error: "Job not found"};

    if (job.status !== "assigned"){
        return {ok: false as const, status: 403, error: "Not assigned artisan"};
    }

    const updated = await withTx(async (client) => {
        return completeJobTx(client, {jobId: input.jobId});
    });

    return {ok:true as const, status: 200, data: updated};
}