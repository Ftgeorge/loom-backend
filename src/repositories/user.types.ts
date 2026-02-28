export type UserRole = "customer" | "artisan";

export type UserRow = {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    created_at: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
}