import { PoolClient } from "pg";
import { UserRole, UserRow } from "./user.types";

export async function createUserTx(
    client: PoolClient,
    input: {
        email: string;
        passwordHash: string;
        role: UserRole;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
    }
) {
    const res = await client.query<UserRow>(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, password_hash, role, created_at, first_name, last_name, phone`,
        [
            input.email,
            input.passwordHash,
            input.role,
            input.firstName ?? null,
            input.lastName ?? null,
            input.phone ?? null,
        ]
    );
    return res.rows[0];
}
