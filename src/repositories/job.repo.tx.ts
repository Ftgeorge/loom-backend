import { PoolClient } from "pg";
import { JobRow } from "./job.repo";

export async function assignJobTx(
    client: PoolClient,
    input: { jobId: string; artisanProfileId: string }
) {
    const res = await client.query<JobRow>(
        `UPDATE job_requests
         SET assigned_artisan_id = $2,
            status = 'assigned'
         WHERE id = $1
         RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, created_at`,
         [input.jobId, input.artisanProfileId]
    );

    return res.rows[0] ?? null;
}

export async function completeJobTx(
    client: PoolClient,
    input: {jobId: string}
) {
    const res = await client.query<JobRow>(
        `UPDATE job_requests
         SET status = 'completed'
        WHERE id = $1
        RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, created_at`,
        [input.jobId]
    );

    return res.rows[0] ?? null;
}