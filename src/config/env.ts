import {z} from "zod";

const EnvSchema = z.object({
    PORT: z.string().optional(),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(20),
    JWT_EXPIRES_IN: z.string().default("7d"),
});

export const env = EnvSchema.parse(process.env);