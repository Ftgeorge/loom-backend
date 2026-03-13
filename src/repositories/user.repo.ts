import { pool } from "../db/pool";
import { query } from "../db/query";
import type { UserRole, UserRow } from "./user.types";

export async function findUserByEmail(email: string) {
    const res = await query<UserRow>(
        `SELECT id, email, password_hash, role, created_at, first_name, last_name, phone, area, city, state, lat, lng, interests, avatar_url
        FROM users
        WHERE email = $1`,
        [email]
    );
    return res.rows[0] ?? null;
}

export async function findUserByPhone(phone: string) {
    const res = await query<UserRow>(
        `SELECT id, email, first_name, last_name, phone, role, created_at, area, city, state, lat, lng, interests, avatar_url
        FROM users
        WHERE phone = $1`,
        [phone]
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

export async function updateUserById(
    userId: string,
    updates: Partial<{
        first_name: string;
        last_name: string;
        phone: string;
        email: string;
        area: string;
        city: string;
        state: string;
        avatar_url: string;
        interests: string[];
    }>
) {
    const fields = Object.keys(updates);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");

    const values = fields.map((field) => (updates as any)[field]);

    const result = await pool.query(
        `UPDATE users
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING id, email, first_name, last_name, phone, role, area, city, state, avatar_url, interests`,
        [...values, userId]
    );

    return result.rows[0] ?? null;
}

export async function listAllUsers() {
    const res = await query<UserRow>(
        `SELECT id, email, first_name, last_name, phone, role, created_at, area, city, state, avatar_url
         FROM users
         ORDER BY created_at DESC`
    );
    return res.rows;
}

export async function deleteUserById(userId: string) {
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
}