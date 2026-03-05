import z from "zod";

export const updateUserSchema = z.object ({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
    email: z.string().email().optional(),
})
