import { z } from "zod";

export const artisanRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z.string().min(7, "Phone number must be at least 7 characters long").optional(),
  bio: z.string().optional(),
  yearsOfExperience: z.number().int().min(0, "Years of experience must be a non-negative integer").optional(),
});

export const updateArtisanSchema = z.object({
  bio: z.string().max(1000).optional(),
  years_of_experience: z.number().int().min(0).max(60).optional(),
});