import { Router } from "express";
import { registerSchema } from "../validators/auth.validators";
import { asyncHandler } from "../utils/asyncHandler";
import { registerUser } from "../services/auth.service";

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
)