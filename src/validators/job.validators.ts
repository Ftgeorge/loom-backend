import { z } from "zod";

export const createJobSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(2),
});

export const assignJobSchema = z.object({
    artisanProfileId: z.string().uuid(),
});

export const completeJobSchema = z.object({
  artisanProfileId: z.string().uuid(),
});

export const rateJobSchema = z.object({
    customerId: z.string().uuid(),
    artisanProfileId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});