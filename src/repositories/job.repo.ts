import { query } from "../db/query";

export type JobRow = {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  urgency: string;
  status: "open" | "assigned" | "accepted" | "on_the_way" | "in_progress" | "completed" | "cancelled";
  assigned_artisan_id: string | null;
  created_at: string;
};

export async function createJob(input: {
  customerId: string;
  title: string;
  description: string;
  location: string;
  budget?: number;
  urgency?: string;
}) {
  const res = await query<JobRow>(
    `INSERT INTO job_requests (customer_id, title, description, location, budget, urgency)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, customer_id, title, description, location, budget, urgency, status, assigned_artisan_id, created_at`,
    [
      input.customerId,
      input.title,
      input.description,
      input.location,
      input.budget ?? 0,
      input.urgency ?? "today",
    ]
  );

  return res.rows[0];
}