-- 014_standardize_pricing.sql
-- Replaces price range with a standardized base fee

ALTER TABLE artisan_profiles
ADD COLUMN base_fee NUMERIC(12, 2) NOT NULL DEFAULT 5000,
ADD COLUMN price_per_hour NUMERIC(12, 2);

-- Update existing records if any
UPDATE artisan_profiles SET base_fee = 5000 WHERE base_fee IS NULL;
