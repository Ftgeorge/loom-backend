import { withTx } from "../db/tx";
import { findArtisanProfileById } from "../repositories/artisan.read.repo";
import { findJobById } from "../repositories/job.read.repo";
import { assignJobTx } from "../repositories/job.repo.tx";

export async function assignJob(input: {
    jobId: string;
    artisanProfileId: string;
}) {
    const job = await findJobById(input.jobId);
    if (!job) {
        return { ok: false as const, status: 404, error: "Job not found" };
    }

    if (job.status !== "open") {
        return { ok: false as const, status: 400, error: "Job is not open" };
    }

    const artisan = await findArtisanProfileById(input.artisanProfileId);
    if (!artisan) {
        return { ok: false as const, status: 404, error: "Artisan not found" };
    }

    const updated = await withTx(async (client) => {
        const res = await assignJobTx(client, input);
        return res;
    })

    return {ok: true as const, status: 200, data: updated};
}