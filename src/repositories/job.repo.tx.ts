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
         RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, budget, urgency, created_at`,
        [input.jobId, input.artisanProfileId]
    );

    return res.rows[0] ?? null;
}

export async function completeJobTx(
    client: PoolClient,
    input: { jobId: string }
) {
    const res = await client.query<JobRow>(
        `UPDATE job_requests
         SET status = 'completed'
        WHERE id = $1
        RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, budget, urgency, created_at`,
        [input.jobId]
    );

    return res.rows[0] ?? null;
}

export async function updateJobStatusTx(
    client: PoolClient,
    input: { jobId: string; status: JobRow["status"] }
) {
    const res = await client.query<JobRow>(
        `UPDATE job_requests
         SET status = $2
         WHERE id = $1
         RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, budget, urgency, created_at`,
        [input.jobId, input.status]
    );
    return res.rows[0] ?? null;
}

export async function cancelJobTx(
    client: PoolClient,
    input: { jobId: string; customerId: string }
) {
    const res = await client.query<JobRow>(
        `UPDATE job_requests
         SET status = 'cancelled'
         WHERE id = $1
           AND customer_id = $2
           AND status IN ('open', 'assigned')
         RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, created_at`,
        [input.jobId, input.customerId]
    );
    return res.rows[0] ?? null;
}