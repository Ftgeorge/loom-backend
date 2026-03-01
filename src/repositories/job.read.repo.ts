import { query } from "../db/query";
import { JobRow } from "./job.repo";

export async function findJobById(jobId: string){
    const res = await query<JobRow>(
        `SELECT id, customer_id, title, description, location, status, assigned_artisan_id
         FROM job_requests
         WHERE id = $1`,
         [jobId]
    );

    return res.rows[0] ?? null;
}