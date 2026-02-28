import {z} from "zod";

const EnvSchema = z.object({
    PORT: z.string().optional(),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export const env = EnvSchema.parse(process.env);