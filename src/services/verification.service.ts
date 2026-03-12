import { createVerification, findVerificationByArtisanId } from "../repositories/verification.repo";
import { findArtisanProfileIdByUserId } from "../repositories/artisan.byUser.repo";

export async function submitVerification(input: {
    userId: string;
    documentType: string;
    documentNumber?: string;
    documentUrl: string;
}) {
    const artisanProfileId = await findArtisanProfileIdByUserId(input.userId);
    if (!artisanProfileId) {
        return { ok: false as const, status: 404, error: "Artisan profile not found" };
    }

    // Check if there is already a pending or approved verification
    const existing = await findVerificationByArtisanId(artisanProfileId);
    if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
        return { ok: false as const, status: 400, error: `You already have a ${existing.status} verification.` };
    }

    const verification = await createVerification({
        artisanProfileId,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        documentUrl: input.documentUrl
    });

    return { ok: true as const, status: 201, data: verification };
}

export async function getMyVerificationStatus(userId: string) {
    const artisanProfileId = await findArtisanProfileIdByUserId(userId);
    if (!artisanProfileId) {
        return { ok: false as const, status: 404, error: "Artisan profile not found" };
    }

    const verification = await findVerificationByArtisanId(artisanProfileId);
    return { ok: true as const, status: 200, data: verification };
}
