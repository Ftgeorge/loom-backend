import bcrypt from "bcrypt";
import { createUserWithProfileFields, findUserByEmail, findUserByPhone } from "../repositories/user.repo";
import type { RegisterInput } from "../validators/auth.validators";


const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
    const existingEmail = await findUserByEmail(input.email);
    if (existingEmail) {
        return { ok: false as const, status: 409, error: "Email already in use" };
    }

    if (input.phone) {
        const existingPhone = await findUserByPhone(input.phone);
        if (existingPhone) {
            return { ok: false as const, status: 409, error: "Phone number already in use" };
        }
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Map 'client' to 'customer' if that's what's in the DB constraint
    const dbRole: any = input.role === "client" ? "customer" : input.role;

    // Split name for potential first/last name fields
    const full_name = input.name?.trim() || "User";
    const [firstName, ...lastNameParts] = full_name.split(' ');
    const lastName = lastNameParts.join(' ');

    try {
        const user = await createUserWithProfileFields({
            email: input.email,
            passwordHash,
            role: dbRole,
            firstName: firstName || null,
            lastName: lastName || null,
            phone: input.phone || null,
        });

        return {
            ok: true as const,
            status: 201,
            data: {
                id: user.id,
                email: user.email,
                role: input.role, // Return the role they expect
                name: full_name,
                created_at: user.created_at,
            },
        };
    } catch (err: any) {
        if (err.code === "23505") { // PostgreSQL unique violation
            if (err.detail?.includes("phone")) {
                return { ok: false as const, status: 409, error: "Phone number already in use" };
            }
            if (err.detail?.includes("email")) {
                return { ok: false as const, status: 409, error: "Email already in use" };
            }
        }
        throw err;
    }
}