-- 012_artisan_portfolio.sql

-- Portfolio table for artisans to showcase their work
CREATE TABLE IF NOT EXISTS artisan_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_profile_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Associate ratings with portfolio items so customers can see reviews for specific works
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ratings' AND column_name='portfolio_item_id') THEN
        ALTER TABLE ratings ADD COLUMN portfolio_item_id UUID REFERENCES artisan_portfolio(id) ON DELETE SET NULL;
    END IF;
END $$;
