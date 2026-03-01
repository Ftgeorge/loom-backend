import { query } from "../db/query";

export type JobRow = {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  location: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  assigned_artisan_id: string | null;
  created_at: string;
};

export async function createJob(input: {
  customerId: string;
  title: string;
  description: string;
  location: string;
}) {
  const res = await query<JobRow>(
    `INSERT INTO job_requests (customer_id, title, description, location)
     VALUES ($1, $2, $3, $4)
     RETURNING id, customer_id, title, description, location, status, assigned_artisan_id, created_at`,
    [input.customerId, input.title, input.description, input.location]
  );

  return res.rows[0];
}