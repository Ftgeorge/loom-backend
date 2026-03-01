-- Ensure skill names are stored in a normalized way
-- (we'll enforce this at API level too, but DB constraints are the final guard)

-- Add a functional unique index for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS skills_name_lower_unique
ON SKILLS (lower(trim(name)));