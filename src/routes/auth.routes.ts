import { Router } from "express";
import { registerSchema } from "../validators/auth.validators";
import { asyncHandler } from "../utils/asyncHandler";
import { registerUser } from "../services/auth.service";
import { loginSchema } from "../validators/login.validators";
import { loginUser } from "../services/auth.logn.service";
import { requireAuth } from "../middleware/requireAuth";
import { rateLimit } from "../middleware/rateLimit";

export const authRouter = Router();

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

        const result  = await registerUser(parsed.data);

        if (!result.ok) {
            return res.status(result.status).json({ error: result.error});
        }
        return res.status(result.status).json(result.data);
    })
);

authRouter.post(
    "/login",
    rateLimit({ windowMs: 60_000, max: 10}),
    asyncHandler(async (req, res) => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({error: "Invalid body", details: parsed.error.flatten() });
        }

        const result = await loginUser(parsed.data);
        if (!result.ok) return res.status(result.status).json({error: result.error});

        return res.status(result.status).json(result.data);
    })
);

authRouter.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
        return res.json({ user: req.user});
    })
);