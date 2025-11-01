-- This script modifies existing foreign key constraints to add ON DELETE actions.
-- This is necessary to handle deletions in referenced tables gracefully.
-- The constraint names are based on standard PostgreSQL naming conventions.

-- For the jobs table
ALTER TABLE public.jobs DROP CONSTRAINT jobs_contractor_id_fkey;
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_contractor_id_fkey
FOREIGN KEY (contractor_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

ALTER TABLE public.jobs DROP CONSTRAINT jobs_freelancer_id_fkey;
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_freelancer_id_fkey
FOREIGN KEY (freelancer_id)
REFERENCES public.profiles (id)
ON DELETE SET NULL;

-- For the applications table
ALTER TABLE public.applications DROP CONSTRAINT applications_job_id_fkey;
ALTER TABLE public.applications
ADD CONSTRAINT applications_job_id_fkey
FOREIGN KEY (job_id)
REFERENCES public.jobs (id)
ON DELETE CASCADE;

ALTER TABLE public.applications DROP CONSTRAINT applications_freelancer_id_fkey;
ALTER TABLE public.applications
ADD CONSTRAINT applications_freelancer_id_fkey
FOREIGN KEY (freelancer_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

-- For the reviews table
ALTER TABLE public.reviews DROP CONSTRAINT reviews_job_id_fkey;
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_job_id_fkey
FOREIGN KEY (job_id)
REFERENCES public.jobs (id)
ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewer_id_fkey;
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewer_id_fkey
FOREIGN KEY (reviewer_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

ALTER TABLE public.reviews DROP CONSTRAINT reviews_reviewee_id_fkey;
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewee_id_fkey
FOREIGN KEY (reviewee_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;