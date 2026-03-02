import { NextFunction, Response, Request } from "express";
import { UserRole } from "../repositories/user.types";

export function requireRole(...roles: UserRole[]){
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({error: "Forbidden"});
        }
        return next();
    }
}