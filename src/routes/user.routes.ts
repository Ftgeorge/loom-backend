import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { updateUserSchema } from "../validators/user.validators";
import { updateUser } from "../services/user.update.service";

import { upload } from "../config/cloudinary";

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

userRouter.post(
    "/me/avatar",
    requireAuth,
    upload.single("avatar"),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const avatarUrl = (req.file as any).path;

        const result = await updateUser({
            userId: req.user!.id,
            updates: { avatar_url: avatarUrl },
        });

        if (!result.ok) {
            return res.status(result.status).json({ error: result.error });
        }

        return res.status(200).json({ avatar_url: avatarUrl });
    })
);