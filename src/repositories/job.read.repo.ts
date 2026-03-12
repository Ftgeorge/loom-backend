import { query } from "../db/query";
import { JobRow } from "./job.repo";

export async function findJobById(jobId: string){
    const res = await query<JobRow>(
        `SELECT id, customer_id, title, description, location, budget, urgency, status, assigned_artisan_id, created_at
         FROM job_requests
         WHERE id = $1`,
         [jobId]
    );

    return res.rows[0] ?? null;
}