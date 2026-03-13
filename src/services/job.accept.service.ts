import { withTx } from "../db/tx";
import { findJobById } from "../repositories/job.read.repo";
import { assignJobTx } from "../repositories/job.repo.tx";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";
import { findVerificationByArtisanId } from "../repositories/verification.repo";

export async function acceptJob(input: {
    jobId: string;
    artisanUserId: string;
}) {
    const job = await findJobById(input.jobId);
    if (!job) {
        return { ok: false as const, status: 404, error: "Job not found" };
    }

    if (job.status !== "open") {
        return { ok: false as const, status: 400, error: "Job is no longer open" };
    }

    const artisan = await findArtisanByUserId(input.artisanUserId);
    if (!artisan) {
        return { ok: false as const, status: 404, error: "Artisan profile not found" };
    }

    const verification = await findVerificationByArtisanId(artisan.artisan_profile_id);
    if (!verification || verification.status !== 'approved') {
        return { 
            ok: false as const, 
            status: 403, 
            error: "Identity verification required. Please complete your profile verification to accept jobs." 
        };
    }

    const updated = await withTx(async (client) => {
        const res = await assignJobTx(client, {
            jobId: input.jobId,
            artisanProfileId: artisan.artisan_profile_id
        });
        return res;
    });

    return { ok: true as const, status: 200, data: updated };
}
