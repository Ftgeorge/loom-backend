import { query } from "../db/query";
import { JobRow } from "./job.repo";

/** All jobs for a customer (their requests) */
export async function findJobsByCustomerId(
    customerId: string,
    status?: string,
    limit = 20,
    offset = 0
) {
    const params: unknown[] = [customerId, limit, offset];
    let where = "WHERE jr.customer_id = $1";
    if (status) {
        params.splice(1, 0, status);
        where += ` AND jr.status = $2`;
        params[params.indexOf(limit)] = limit; // shift limit index
    }

    const conditions = ["jr.customer_id = $1"];
    const values: unknown[] = [customerId];
    if (status) {
        const statuses = status.split(",").filter(Boolean);
        if (statuses.length > 0) {
            conditions.push(`jr.status = ANY($${values.length + 1})`);
            values.push(statuses);
        }
    }
    values.push(limit, offset);

    const res = await query<JobRow & { customer_email: string; artisan_email?: string }>(
        `SELECT
            jr.id,
            jr.customer_id,
            jr.title,
            jr.description,
            jr.location,
            jr.status,
            jr.assigned_artisan_id,
            jr.created_at,
            u.email AS customer_email,
            au.email AS artisan_email
         FROM job_requests jr
         JOIN users u ON u.id = jr.customer_id
         LEFT JOIN artisan_profiles ap ON ap.id = jr.assigned_artisan_id
         LEFT JOIN users au ON au.id = ap.user_id
         WHERE ${conditions.join(" AND ")}
         ORDER BY jr.created_at DESC
         LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values
    );
    return res.rows;
}

/** All jobs available to artisans (open jobs) */
export async function findOpenJobs(limit = 20, offset = 0) {
    const res = await query<JobRow & { customer_email: string }>(
        `SELECT
            jr.id,
            jr.customer_id,
            jr.title,
            jr.description,
            jr.location,
            jr.status,
            jr.assigned_artisan_id,
            jr.created_at,
            u.email AS customer_email
         FROM job_requests jr
         JOIN users u ON u.id = jr.customer_id
         WHERE jr.status = 'open'
         ORDER BY jr.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return res.rows;
}

/** Jobs assigned to a specific artisan */
export async function findJobsByArtisanId(
    artisanProfileId: string,
    status?: string,
    limit = 20,
    offset = 0
) {
    const conditions = ["jr.assigned_artisan_id = $1"];
    const values: unknown[] = [artisanProfileId];
    if (status) {
        conditions.push(`jr.status = $${values.length + 1}`);
        values.push(status);
    }
    values.push(limit, offset);

    const res = await query<JobRow & { rating_id?: string; rating_value?: number }>(
        `SELECT jr.id, jr.customer_id, jr.title, jr.description,
                jr.location, jr.status, jr.assigned_artisan_id, jr.created_at,
                r.id AS rating_id, r.rating AS rating_value
         FROM job_requests jr
         LEFT JOIN ratings r ON r.job_request_id = jr.id
         WHERE ${conditions.join(" AND ")}
         ORDER BY jr.created_at DESC
         LIMIT $${values.length - 1} OFFSET $${values.length}`,
        values
    );
    return res.rows;
}

/** Single job with full detail */
export async function findJobByIdFull(jobId: string) {
    const res = await query<
        JobRow & {
            customer_email: string;
            customer_first_name: string | null;
            customer_last_name: string | null;
            artisan_email?: string;
        }
    >(
        `SELECT
            jr.id,
            jr.customer_id,
            jr.title,
            jr.description,
            jr.location,
            jr.status,
            jr.assigned_artisan_id,
            jr.created_at,
            u.email AS customer_email,
            u.first_name AS customer_first_name,
            u.last_name AS customer_last_name,
            au.email AS artisan_email
         FROM job_requests jr
         JOIN users u ON u.id = jr.customer_id
         LEFT JOIN artisan_profiles ap ON ap.id = jr.assigned_artisan_id
         LEFT JOIN users au ON au.id = ap.user_id
         WHERE jr.id = $1`,
        [jobId]
    );
    return res.rows[0] ?? null;
}

/** Count jobs for pagination */
export async function countJobsByCustomerId(customerId: string, status?: string) {
    const conditions = ["customer_id = $1"];
    const values: unknown[] = [customerId];
    if (status) {
        conditions.push(`status = $${values.length + 1}`);
        values.push(status);
    }
    const res = await query<{ total: number }>(
        `SELECT COUNT(*)::int AS total FROM job_requests WHERE ${conditions.join(" AND ")}`,
        values
    );
    return res.rows[0]?.total ?? 0;
}
