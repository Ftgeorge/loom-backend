import bcrypt from "bcrypt";
import { withTx } from "../db/tx";
import { findUserByEmail } from "../repositories/user.repo";
import { createUserTx } from "../repositories/user.repo.tx";
import { createArtisanProfileTx } from "../repositories/artisan.repo.tx";

const SALT_ROUNDS = 12;

export async function registerArtisan(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    yearsOfExperience?: number;
}) {
    const existing = await findUserByEmail(input.email);
    if (existing){
        return { ok: false as const, status: 409, error: "Email already in use"};
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const result = await withTx(async (client) => {
        const user = await createUserTx(client, {
            email: input.email,
            passwordHash,
            role: "artisan",
            firstName: input.firstName ?? null,
            lastName: input.lastName ?? null,
            phone: input.phone ?? null,
        });

        const profile = await createArtisanProfileTx(client, {
            userId: user.id,
            bio: input.bio ?? null,
            yearsOfExperience: input.yearsOfExperience ?? 0,
        });
        return {user, profile};
    });

    return {
        ok: true as const,
        status: 201,
        data: {
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                first_name: result.user.first_name,
                last_name: result.user.last_name,
                phone: result.user.phone,
                created_at: result.user.created_at,
            },
            artisan_profile: result.profile,
        }
    }
}