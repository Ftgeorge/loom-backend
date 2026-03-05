import { Router } from "express";
import { registerSchema } from "../validators/auth.validators";
import { asyncHandler } from "../utils/asyncHandler";
import { registerUser } from "../services/auth.service";
import { loginSchema } from "../validators/login.validators";
import { loginUser } from "../services/auth.logn.service";
import { requireAuth } from "../middleware/requireAuth";
import { rateLimit } from "../middleware/rateLimit";
import { requestEmailVerification } from "../services/emailVerification.request.service";
import { verifyEmail } from "../services/emailVerification.verify.service";
import { signToken } from "../auth/jwt";
import { createUser, findUserByEmail } from "../repositories/user.repo";
import bcrypt from "bcrypt";

export const authRouter = Router();

// ─── Register ────────────────────────────────────────────
authRouter.post(
    "/register",
    asyncHandler(async (req, res) => {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: parsed.error.flatten(),
            });
        }

        const result = await registerUser(parsed.data);

        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }

        // Auto-request OTP after registration
        if (parsed.data.email) {
            await requestEmailVerification(result.data.id, parsed.data.email);
        }

        return res.status(result.status).json(result.data);
    })
);

// ─── Login ───────────────────────────────────────────────
authRouter.post(
    "/login",
    rateLimit({ windowMs: 60_000, max: 10 }),
    asyncHandler(async (req, res) => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        }

        const result = await loginUser(parsed.data);
        if (!result.ok) return res.status(result.status).json({ error: result.error });

        return res.status(result.status).json(result.data);
    })
);

// ─── Get Current User ────────────────────────────────────
authRouter.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
        return res.json({ user: req.user });
    })
);

// ─── Request OTP ─────────────────────────────────────────
authRouter.post(
    "/request-otp",
    requireAuth,
    rateLimit({ windowMs: 60_000, max: 5 }),
    asyncHandler(async (req, res) => {
        const { email } = req.body;
        if (!email || typeof email !== "string") {
            return res.status(400).json({ error: "email is required" });
        }

        const result = await requestEmailVerification(req.user!.id, email);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(200).json({ message: "OTP sent" });
    })
);

// ─── Verify OTP ──────────────────────────────────────────
authRouter.post(
    "/verify-otp",
    requireAuth,
    asyncHandler(async (req, res) => {
        const { otp } = req.body;
        if (!otp || typeof otp !== "string" || otp.length !== 6) {
            return res.status(400).json({ error: "A valid 6-digit OTP is required" });
        }

        const result = await verifyEmail(req.user!.id, otp);
        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(200).json({ message: "Email verified successfully" });
    })
);

// ─── Google OAuth (Clerk) ────────────────────────────────
// When the user signs in with Google via Clerk on the frontend,
// the frontend sends the Clerk session token + user info to this endpoint.
// We upsert the user in our DB and issue our own JWT.
authRouter.post(
    "/google",
    rateLimit({ windowMs: 60_000, max: 20 }),
    asyncHandler(async (req, res) => {
        const { email, name, clerkUserId, role } = req.body;

        if (!email || !clerkUserId) {
            return res.status(400).json({ error: "email and clerkUserId are required" });
        }

        // Verify with Clerk (optional server-side — skipped if no secret set)
        // In production: verify the Clerk session token via Clerk SDK here

        let user = await findUserByEmail(email);

        if (!user) {
            // First-time Google sign-in: create account (no password)
            const randomHash = await bcrypt.hash(Math.random().toString(36), 10);
            user = await createUser({
                email,
                passwordHash: randomHash,
                role: role ?? "customer",
            });
        }

        const token = signToken({ sub: user.id, role: user.role });

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: name ?? email.split("@")[0],
            },
        });
    })
);