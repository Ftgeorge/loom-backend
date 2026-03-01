import { createJob } from "../repositories/job.repo";

export async function createJobRequest(input: {
  customerId: string;
  title: string;
  description: string;
  location: string;
}) {
  // Business rules will live here later (auth, quotas, validation rules)
  const job = await createJob(input);
  return job;
}