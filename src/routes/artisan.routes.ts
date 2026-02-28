import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { artisanRegisterSchema } from "../validators/artisan.validator";
import { registerArtisan } from "../services/artisan.service";

export const artisanRouter = Router();

artisanRouter.post(
    "/",
    asyncHandler(async (req, res) => {
        const parsed = artisanRegisterSchema.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: parsed.error.flatten(),
            });
        }

        const result = await registerArtisan(parsed.data);

        if (!result.ok){
            return res.status(result.status).json({error: result.error});
        }

        return res.status(result.status).json(result.data);
    })
);