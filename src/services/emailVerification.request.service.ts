import { Resend } from "resend";
import { pool } from "../db/pool";
import { generateOTP, hashOTP } from "../utils/otp";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@loom.ng";

export async function requestEmailVerification(userId: string, email: string) {
    // Cooldown check: prevent spam (1 OTP per 60 seconds)
    const lastToken = await pool.query(
        `SELECT created_at FROM email_verification_tokens
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
    );

    if (lastToken.rows.length > 0) {
        const lastSent = new Date(lastToken.rows[0].created_at).getTime();
        const now = Date.now();
        if (now - lastSent < 60_000) {
            return { ok: false as const, status: 429, error: "COOLDOWN_ACTIVE" };
        }
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
        `INSERT INTO email_verification_tokens (user_id, otp_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, otpHash, expiresAt]
    );

    // Send via Resend (or fall back to console in dev)
    if (
        process.env.RESEND_API_KEY &&
        process.env.RESEND_API_KEY !== "re_YOUR_KEY_HERE"
    ) {
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: email,
                subject: "Your Loom verification code",
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                        <h1 style="font-size: 24px; font-weight: 700; color: #064E3B; margin-bottom: 8px;">Loom</h1>
                        <p style="color: #44403C; font-size: 16px; margin-bottom: 32px;">
                            Here is your one-time verification code:
                        </p>
                        <div style="background: #F0FDF4; border: 2px solid #064E3B; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                            <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #064E3B;">${otp}</span>
                        </div>
                        <p style="color: #78716C; font-size: 14px;">
                            This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                        </p>
                        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 24px 0;" />
                        <p style="color: #9CA3AF; font-size: 12px;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                `,
            });
        } catch (err) {
            console.error("[Resend] Failed to send email:", err);
            // Don't throw — OTP is already stored, user can retry
        }
    } else {
        // Dev fallback: log to console
        console.log(`\n[EMAIL SIM] OTP for ${email}: ${otp}\n`);
    }

    return { ok: true as const, status: 200 };
}