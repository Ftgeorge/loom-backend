import type {NextFunction, Request, Response} from "express";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    //Default safe response
    const message = err instanceof Error ? err.message : "Unexpected server error";

    // In production we keep it generic; in dev we can show message
    const isProd = process.env.NODE_ENV === "production";

    res.status(500).json ({
        error: isProd ? "Internal Server Error" : message,
    });
}