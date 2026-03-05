-- seed/clear_db.sql
TRUNCATE TABLE 
    notifications,
    messages,
    message_threads,
    email_verification_tokens,
    ratings,
    artisan_earnings,
    artisan_skills,
    job_requests,
    artisan_profiles,
    users,
    skills
RESTART IDENTITY CASCADE;
