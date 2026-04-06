-- 020_expand_job_statuses.sql
-- Expand the set of allowed statuses for job requests to support granular tracking.

-- We need to drop the old check constraint first.
-- In 003_core_schema.sql it was: CHECK (status IN ('open', 'assigned', 'completed', 'cancelled'))
-- Postgres generates a name for this constraint. We'll search for it or just try to replace the type if using an enum.
-- Since it's a TEXT field with CHECK constraint, we usually have to drop the constraint.

DO $$
BEGIN
    ALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_status_check;
END $$;

ALTER TABLE job_requests 
ADD CONSTRAINT job_requests_status_check 
CHECK (status IN ('open', 'assigned', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'));

-- Update existing 'assigned' to 'matched' is not needed if we keep 'assigned' as the backend value for Match.
-- But wait, our mappers.ts maps 'assigned' to 'matched'.
-- Let's keep 'assigned' as the state when customer assigns but artisan hasn't accepted.
-- Once artisan accepts, it becomes 'accepted'.
