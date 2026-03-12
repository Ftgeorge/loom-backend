import { query } from "../db/query";

export type VerificationRow = {
    id: string;
    artisan_profile_id: string;
    document_type: string;
    document_number: string | null;
    document_url: string;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
};

export async function createVerification(input: {
    artisanProfileId: string;
    documentType: string;
    documentNumber?: string;
    documentUrl: string;
}) {
    const res = await query<VerificationRow>(
        `INSERT INTO artisan_verifications (artisan_profile_id, document_type, document_number, document_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [input.artisanProfileId, input.documentType, input.documentNumber ?? null, input.documentUrl]
    );
    return res.rows[0];
}

export async function findVerificationByArtisanId(artisanProfileId: string) {
    const res = await query<VerificationRow>(
        `SELECT * FROM artisan_verifications
         WHERE artisan_profile_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [artisanProfileId]
    );
    return res.rows[0] ?? null;
}
