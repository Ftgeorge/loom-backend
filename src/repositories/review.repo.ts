import { query } from "../db/query";

export type ReviewRow = {
    id: string;
    artisan_id: string;
    customer_id: string;
    customer_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
};

export async function findArtisanReviews(artisanId: string) {
    const res = await query<ReviewRow>(
        `SELECT 
            r.id, 
            r.artisan_id, 
            r.rating, 
            r.comment, 
            r.created_at,
            u.first_name || ' ' || COALESCE(u.last_name, '') as customer_name
         FROM ratings r
         JOIN users u ON u.id = r.customer_id
         WHERE r.artisan_id = $1
         ORDER BY r.created_at DESC`,
        [artisanId]
    );
    return res.rows;
}
