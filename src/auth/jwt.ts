import jwt from "jsonwebtoken";
import { env } from "../config/env";

import { UserRole } from "../repositories/user.types";

export type JwtPayload = {
    sub: string;
    role: UserRole;
};

export function signToken(payload: JwtPayload) {
    return jwt.sign(payload as object, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });
}

export function verifyToken(token:string) {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}