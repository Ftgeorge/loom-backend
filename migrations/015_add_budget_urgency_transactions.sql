-- 015_add_budget_urgency_transactions.sql

ALTER TABLE job_requests 
ADD COLUMN IF NOT EXISTS budget NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'today';

CREATE TABLE IF NOT EXISTS artisan_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_profile_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_requests(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artisan_tx_artisan ON artisan_transactions (artisan_profile_id, created_at DESC);
