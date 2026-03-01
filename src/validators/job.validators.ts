import { z } from "zod";

export const createJobSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
});