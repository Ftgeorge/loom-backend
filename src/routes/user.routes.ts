import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { updateUserSchema } from "../validators/user.validators";
import { updateUser } from "../services/user.update.service";

export const userRouter = Router();

userRouter.patch(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
        const parsed = updateUserSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid body",
                details: parsed.error.flatten(),
            });
        }

        const result = await updateUser({
            userId: req.user!.id,
            updates: parsed.data,
        });

        if (!result.ok) {
            return res.status(result.status).json({error: result.error});        
        }

        return res.status(result.status).json(result.data);
    })
);