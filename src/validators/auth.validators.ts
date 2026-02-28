import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["customer", "artisan"], "Role must be either 'customer' or 'artisan'"),
})

export type RegisterInput = z.infer<typeof registerSchema>;