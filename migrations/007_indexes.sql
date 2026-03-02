-- speeds artisan profile lookup from user id (secure complete)
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_user_id ON artisan_profiles(user_id);

-- speeds up skill matching and join
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON skills (lower(trim(name)));

CREATE INDEX IF NOT EXISTS idx_artisan_skills_artisan_profile_id ON artisan_skills(artisan_profile_id);
CREATE INDEX IF NOT EXISTS idx_artisan_skills_skill_id ON artisan_skills(skill_id);

-- speeds rating aggregation by artisan
CREATE INDEX IF NOT EXISTS idx_ratings_artisan_id ON ratings(artisan_id);

-- speeds job lookups and status transitions
CREATE INDEX IF NOT EXISTS idx_job_requests_customer_id ON job_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_assigned_artisan_id ON job_requests(assigned_artisan_id);