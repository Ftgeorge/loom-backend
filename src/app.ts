import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { pool } from "./db/pool";
import {asyncHandler} from "./utils/asyncHandler";
import { errorHandler } from "./middleware/error";
import { authRouter } from "./routes/auth.routes";
import { artisanRouter } from "./routes/artisan.routes";


export function createApp(): Express {
    const app = express();

    // Security headers
    app.use(helmet());

    // Allow requires
    app.use(cors());

    // Parse JSON bodies
    app.use(express.json({limit: "1mb"}));

    // Request logs
    app.use(morgan("dev"));

    // Health check
    app.get("/health", (_req, res) => {
        res.json({status: "ok"});
    })

    app.get("/health/db", asyncHandler(async (_req, res) => {
        const result = await pool.query("SELECT 1 as ok");
        res.json({db:result.rows[0].ok === 1});
    }));

    app.use("/auth", authRouter);

    app.use("/artisans", artisanRouter);

    app.use(errorHandler);

    return app;
}