import { signToken } from "../auth/jwt";
import { findUserByEmail } from "../repositories/user.repo";
import bcrypt from "bcrypt";

export async function loginUser(input: {email: string, password: string}){
    const user = await findUserByEmail(input.email);
    if (!user){
        return {ok: false as const, status: 401, error: "Invalid credentials"};
    }

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
        return {ok: false as const, status: 401, error: "Invalid credentials"};
    }
    const token = signToken({sub: user.id, role:user.role});

    return {
        ok: true as const,
        status: 200,
        data: {
            token,
            user: {id: user.id, email: user.email, role: user.role},
        }
    }
}