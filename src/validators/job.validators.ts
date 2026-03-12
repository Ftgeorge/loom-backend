import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3).optional(),
  skill: z.string().min(2).optional(),
  description: z.string().min(10),
  location: z.string().min(2),
  budget: z.number().int().nonnegative().optional(),
  urgency: z.string().optional(),
});

export const assignJobSchema = z.object({
    artisanProfileId: z.string().uuid(),
});

export const completeJobSchema = z.object({});

export const rateJobSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});