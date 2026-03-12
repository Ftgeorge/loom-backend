-- 016_artisan_verification.sql

CREATE TABLE IF NOT EXISTS artisan_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_profile_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_number TEXT,
    document_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_artisan_verif_status ON artisan_verifications (status);
CREATE INDEX IF NOT EXISTS idx_artisan_verif_artisan ON artisan_verifications (artisan_profile_id);
