import { query } from "../db/query";

export type RatingRow = {
    id: string;
    job_request_id: string;
    customer_id: string;
    artisan_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
};

export async function createRating(input: {
    jobId: string;
    customerId: string;
    artisanId: string;
    rating: number;
    comment?: string | null;
}) {
    const res = await query<RatingRow>(
        `INSERT INTO ratings (job_request_id, customer_id, artisan_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, job_request_id, customer_id, artisan_id, rating, comment, created_at`,
         [input.jobId, input.customerId, input.artisanId, input.rating, input.comment ?? null]
    );
    return res.rows[0];
}