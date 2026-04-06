import { findArtisansBySkill } from "../repositories/artisan.search.repo";
import { findJobById } from "../repositories/job.read.repo";

export async function getJobMatches(input: { jobId: string; skill: string }) {
    const job = await findJobById(input.jobId);
    if (!job) {
        return { ok: false as const, status: 404, error: "Job not found" }
    }

    if (job.status !== "open") {
        return { ok: false as const, status: 400, error: "Job is not open" };
    }

    const artisans = await findArtisansBySkill({ skill: input.skill, limit: 20, offset: 0 });

    return {
        ok: true as const,
        status: 200,
        data: {
            job,
            skill: input.skill,
            count: artisans.length,
            artisans,
        },
    };
}