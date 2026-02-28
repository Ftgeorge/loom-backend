import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../repositories/user.repo";
import type {RegisterInput} from "../validators/auth.validators";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput){
    const existing = await findUserByEmail(input.email);
    if (existing){
        return {
            ok: false as const,
            status: 409,
            error: "Email already in use",
        };
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await createUser({
        email: input.email,
        passwordHash,
        role: input.role,
    });

    return {
        ok: true as const,
        status: 201,
        data: {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        },
    };
}