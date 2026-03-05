import { withTx } from "../db/tx";
import { createArtisanProfileTx } from "../repositories/artisan.repo.tx";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";

export async function upgradeToArtisan(input: {
    userId: string;
    bio?: string;
    yearsOfExperience?: number;
}) {
    // Check if already has a profile
    const existing = await findArtisanByUserId(input.userId);
    if (existing) {
        return { ok: false as const, status: 400, error: "Artisan profile already exists" };
    }

    const result = await withTx(async (client) => {
        const profile = await createArtisanProfileTx(client, {
            userId: input.userId,
            bio: input.bio ?? null,
            yearsOfExperience: input.yearsOfExperience ?? 0,
        });
        return profile;
    });

    return {
        ok: true as const,
        status: 201,
        data: result
    };
}
