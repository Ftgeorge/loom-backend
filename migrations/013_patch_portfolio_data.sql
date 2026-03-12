-- Patch to populate mock portfolio data for existing artisans
-- and link any existing ratings to these items so the gallery isn't empty.

DO $$
DECLARE
    artisan_rec RECORD;
    portfolio_id UUID;
BEGIN
    FOR artisan_rec IN SELECT id, bio FROM artisan_profiles LOOP
        -- Insert a mock portfolio item for each artisan
        INSERT INTO artisan_portfolio (artisan_profile_id, image_url, title, description)
        VALUES (
            artisan_rec.id,
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
            'Major Project Completion',
            'A showcase of my professional work and attention to detail.'
        )
        RETURNING id INTO portfolio_id;

        -- Link all existing ratings for this artisan to this first portfolio item
        -- This ensures reviews show up in the gallery for now.
        UPDATE ratings
        SET portfolio_item_id = portfolio_id
        WHERE artisan_id = artisan_rec.id AND portfolio_item_id IS NULL;
    END LOOP;
END $$;
