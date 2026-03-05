import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["customer", "artisan", "client"], "Invalid role"),
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>;