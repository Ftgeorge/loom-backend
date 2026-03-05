import { query } from "../db/query";

export type EarningsRow = {
    artisan_profile_id: string;
    total_earned: string;
    jobs_completed: number;
    pending_payout: string;
    total_withdrawn: string;
    updated_at: string;
};

export async function findEarningsByArtisanProfileId(artisanProfileId: string) {
    const res = await query<EarningsRow>(
        `SELECT artisan_profile_id, total_earned, jobs_completed,
                pending_payout, total_withdrawn, updated_at
         FROM artisan_earnings
         WHERE artisan_profile_id = $1`,
        [artisanProfileId]
    );
    return res.rows[0] ?? null;
}

/** Upsert earnings row — called after a job is completed and rated */
export async function upsertEarnings(input: {
    artisanProfileId: string;
    additionalEarned?: number;
    incrementJobs?: boolean;
}) {
    await query(
        `INSERT INTO artisan_earnings (artisan_profile_id, total_earned, jobs_completed, pending_payout)
         VALUES ($1, $2, $3, $2)
         ON CONFLICT (artisan_profile_id) DO UPDATE
           SET total_earned    = artisan_earnings.total_earned + EXCLUDED.total_earned,
               jobs_completed  = artisan_earnings.jobs_completed + EXCLUDED.jobs_completed,
               pending_payout  = artisan_earnings.pending_payout + EXCLUDED.total_earned,
               updated_at      = now()`,
        [
            input.artisanProfileId,
            input.additionalEarned ?? 0,
            input.incrementJobs ? 1 : 0,
        ]
    );
}
