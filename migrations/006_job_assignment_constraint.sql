ALTER TABLE job_requests
ADD CONSTRAINT job_assigned_requires_artisan
CHECK (
  (status <> 'assigned') OR (assigned_artisan_id IS NOT NULL)
);