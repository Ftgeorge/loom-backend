import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../repositories/user.repo";
import type {RegisterInput} from "../validators/auth.validators";
import { pool } from "../db/pool";
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput){
    const existing = await findUserByEmail(input.email);
    if (existing){
        return {
            ok: false as const,
            status: 409,
            error: "Email already in use",
        };
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await createUser({
        email: input.email,
        passwordHash,
        role: input.role,
    });

    return {
        ok: true as const,
        status: 201,
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        },
    };
}

export const requestEmailVerification = async (userId: string) => {
    // 1. Check for cooldown (e.g., last OTP sent < 1 minute ago)
    const lastToken = await pool.query(
        `SELECT created_at FROM email_verification_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );

    if (lastToken.rows.length > 0) {
        const lastSent = new Date(lastToken.rows[0].created_at).getTime();
        const now = new Date().getTime();
        if (now - lastSent < 60000) {
            throw new Error('COOLDOWN_ACTIVE');
        }
    }

    // 2. GENERATE 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60000);

    // 3. Store hashed OTP
    await pool.query(
        'INSET INTO email_verification (user_id, otp_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, otpHash, expiresAt]
    );

    // 4. Simulate Email Sending
    console.log(`[EMAIL SIMULATION] Sending OTP ${otp} to user ${userId}`);

    return {success: true};
};

export const verifyEmailOtp = async (userId: string, otp: string) => {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid, unused, non-expired token
    const result = await pool.query(
        `SELECT * FROM email_verification_tokens
        WHERE user_id = $1 AND otp_hash = $2 AND used = false AND expires_at > NOW()`,
        [userId, otpHash]
    );

    if (result.rows.length === 0){
        throw new Error('INVALID_OR_EXPIRED_OTP');
    }

    // Transaction: Mark used and verify user
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [result.rows[0].id]);
        await client.query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);
        await client.query("COMMIT");
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};