import { pool } from "../db/pool";
import { hashOTP } from "../utils/otp";

export async function verifyEmail(userId: string, otp: string) {
    const otpHash = hashOTP(otp);

    const { rows } = await pool.query(
        `
        SELECT *
        FROM email_verification_tokens
        WHERE user_id = $1
            AND otp_hash = $2
            AND used = false
            AND expires_at > now()
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId, otpHash]
    );

    const token = rows[0];

    if (!token) {
        return { ok: false as const, status: 400, error: "invalid or expired OTP" };
    }

    await pool.query("UPDATE email_verification_tokens SET used = true WHERE id = $1", [token.id]);

    await pool.query("UPDATE users SET email_verified = true WHERE id = $1", [userId]);

    return { ok: true as const, status: 200 };
}