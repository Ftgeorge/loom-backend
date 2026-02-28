 -- 003_core_schema.sql

 -- We'll use UUIDs. If your Postgres doesn't have uuid-ossp, 001_init.sql enabled it.
 -- Alternative is pgcrypto gen_random_uuid(), but we'll stick with uuid-ossp for now.

 -- USERS 
 CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT  uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'artisan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 );

 -- ARTISAN PROFILES (only for atrtisans)
 CREATE TABLE IF NOT EXISTS artisan_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    years_of_experience INT NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 );

 -- SKILLS
 CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 );

 -- ARTISAN_SKILLS (many-to-many)
 CREATE TABLE IF NOT EXISTS artisan_skills (
    artisan_profile_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (artisan_profile_id, skill_id)
 );

 -- JOB REQUESTS
 CREATE TABLE IF NOT EXISTS job_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')) DEFAULT 'open',
    assigned_artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 );

 -- RATINGS (after completion)
 CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_request_id UUID NOT NULL UNIQUE REFERENCES job_requests(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    artisan_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (RATING >= 1 and RATING <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
 );

 -- Helpful indexes for matching/filtering
 CREATE INDEX IF NOT EXISTS idx_skills_name ON skills (name);
 CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests (status);
 CREATE INDEX IF NOT EXISTS idx_job_requests_location ON job_requests (location);