-- 019_add_user_interests.sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
