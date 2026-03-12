import { query } from "../db/query";

export type EarningsRow = {
    artisan_profile_id: string;
    total_earned: string;
    jobs_completed: number;
    pending_payout: string;
    total_withdrawn: string;
    updated_at: string;
};

export type TransactionRow = {
    id: string;
    artisan_profile_id: string;
    job_id: string | null;
    amount: string;
    type: 'credit' | 'debit';
    description: string;
    status: string;
    created_at: string;
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

export async function findTransactionsByArtisanId(artisanProfileId: string, limit = 20) {
    const res = await query<TransactionRow>(
        `SELECT id, artisan_profile_id, job_id, amount, type, description, status, created_at
         FROM artisan_transactions
         WHERE artisan_profile_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [artisanProfileId, limit]
    );
    return res.rows;
}

export async function createTransaction(tx: {
    artisanProfileId: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    jobId?: string;
}) {
    await query(
        `INSERT INTO artisan_transactions (artisan_profile_id, amount, type, description, job_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [tx.artisanProfileId, tx.amount, tx.type, tx.description, tx.jobId]
    );
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
           SET total_earned    = (artisan_earnings.total_earned::numeric + $2)::text,
               jobs_completed  = artisan_earnings.jobs_completed + $3,
               pending_payout  = (artisan_earnings.pending_payout::numeric + $2)::text,
               updated_at      = now()`,
        [
            input.artisanProfileId,
            input.additionalEarned ?? 0,
            input.incrementJobs ? 1 : 0,
        ]
    );
}
