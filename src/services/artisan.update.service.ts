import { updateArtisanProfileByUserId } from "../repositories/artisan.repo";

export async function updateArtisan(input: {
    userId: string;
    updates: {
        bio?: string;
        years_of_experience?: number;
    };
}) {
    const updated = await updateArtisanProfileByUserId(
        input.userId,
        input.updates
    );

    if (!updated) {
        return {ok: false as const, status: 404, error: "Artisan profile not found or nothing to update"};
    }

    return {ok: true as const, status: 200, data:updated};
}