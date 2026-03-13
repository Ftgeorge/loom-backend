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

export type VerificationJoinRow = VerificationRow & {
    first_name: string;
    last_name: string;
    email: string;
    bio: string | null;
};

export async function listAllVerifications(status?: string) {
    let sql = `
        SELECT 
            av.*,
            u.first_name,
            u.last_name,
            u.email,
            ap.bio
        FROM artisan_verifications av
        JOIN artisan_profiles ap ON ap.id = av.artisan_profile_id
        JOIN users u ON u.id = ap.user_id
    `;
    const values: string[] = [];
    if (status) {
        sql += ` WHERE av.status = $1`;
        values.push(status);
    }
    sql += ` ORDER BY av.created_at DESC`;
    const res = await query<VerificationJoinRow>(sql, values);
    return res.rows;
}

export async function updateVerificationStatus(id: string, status: 'approved' | 'rejected', reason?: string) {
    const res = await query<VerificationRow>(
        `UPDATE artisan_verifications
         SET status = $1, rejection_reason = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [status, reason ?? null, id]
    );
    return res.rows[0];
}
