import { query } from "../db/query";

export type PortfolioItemRow = {
    id: string;
    artisan_profile_id: string;
    image_url: string;
    title: string;
    description: string | null;
    created_at: string;
    rating?: number;
    comment?: string;
    customer_name?: string;
};

/** Get portfolio for a specific artisan */
export async function findPortfolioByArtisanId(artisanProfileId: string): Promise<PortfolioItemRow[]> {
    const res = await query<PortfolioItemRow>(
        `SELECT
            ap.id,
            ap.artisan_profile_id,
            ap.image_url,
            ap.title,
            ap.description,
            ap.created_at,
            r.rating,
            r.comment,
            u.first_name || ' ' || COALESCE(u.last_name, '') as customer_name
         FROM artisan_portfolio ap
         LEFT JOIN ratings r ON r.portfolio_item_id = ap.id
         LEFT JOIN users u ON u.id = r.customer_id
         WHERE ap.artisan_profile_id = $1
         ORDER BY ap.created_at DESC`,
        [artisanProfileId]
    );
    return res.rows;
}

/** Add a new portfolio item */
export async function insertPortfolioItem(input: {
    artisanProfileId: string;
    imageUrl: string;
    title: string;
    description?: string;
}) {
    const res = await query<{ id: string }>(
        `INSERT INTO artisan_portfolio (artisan_profile_id, image_url, title, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [input.artisanProfileId, input.imageUrl, input.title, input.description ?? null]
    );
    return res.rows[0];
}

/** Link a portfolio item to an existing rating */
export async function linkPortfolioItemToRating(portfolioItemId: string, ratingId: string) {
    await query(
        `UPDATE ratings
         SET portfolio_item_id = $1
         WHERE id = $2`,
        [portfolioItemId, ratingId]
    );
}

/** Delete a portfolio item */
export async function deletePortfolioItem(id: string, artisanProfileId: string) {
    await query(`DELETE FROM artisan_portfolio WHERE id = $1 AND artisan_profile_id = $2`, [id, artisanProfileId]);
}
