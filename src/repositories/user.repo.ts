import {query} from "../db/query";
import type {UserRole, UserRow} from "./user.types";

export async function findUserByEmail(email: string) {
    const res = await query<UserRow>(
        `SELECT id, email, password_hash, role, created_at
        FROM users
        WHERE email = $1`,
        [email]
    );
    return res.rows[0] ?? null;
}

export async function createUser(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
}) {
    const res = await query<UserRow>(
       `INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, email, password_hash, role, created_at`,
        [input.email, input.passwordHash, input.role]
    );

    return res.rows[0];
}

export async function createUserWithProfileFields(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
}) {
    const res = await query<UserRow>(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, password_hash, role, created-at, first_name, last_name, phone`,
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