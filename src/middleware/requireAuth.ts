import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header"});
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = verifyToken(token);
        req.user = {id: payload.sub, role: payload.role};
        return next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}