export type UserRole = "customer" | "artisan" | "admin";

export type UserRow = {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    created_at: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    area?: string | null;
    city?: string | null;
    state?: string | null;
    lat?: number | null;
    lng?: number | null;
    interests?: string[] | null;
    avatar_url?: string | null;
};