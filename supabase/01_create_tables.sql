CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) for the profiles table.
-- From now on, no one can access this table unless a policy allows them to.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- This policy allows anyone (even non-logged-in users) to view all profiles.
CREATE POLICY "Profiles are viewable by everyone." ON profiles
FOR SELECT USING (true);

-- This policy allows a logged-in user to create their own profile.
-- The check ensures the user ID they are inserting matches their own auth ID.
CREATE POLICY "Users can insert their own profile." ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- This policy allows a user to update their own profile.
CREATE POLICY "Users can update their own profile." ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_text TEXT,
  value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  contractor_id UUID REFERENCES profiles(id),
  freelancer_id UUID REFERENCES profiles(id) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for the jobs table.
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- This policy allows anyone to view all jobs.
CREATE POLICY "Jobs are viewable by everyone." ON jobs
FOR SELECT USING (true);

-- This policy allows a user to create a job for themselves.
-- The check ensures the user's ID matches the contractor_id in the new job.
CREATE POLICY "Users can create their own jobs." ON jobs
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- This policy allows a user to update a job they created.
CREATE POLICY "Users can update their own jobs." ON jobs
FOR UPDATE USING (auth.uid() = contractor_id);

-- This policy allows a user to delete a job they created.
CREATE POLICY "Users can delete their own jobs." ON jobs
FOR DELETE USING (auth.uid() = contractor_id);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  freelancer_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for the applications table.
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- This policy allows a user to view an application if:
-- 1. They are the freelancer who applied.
-- OR
-- 2. They are the contractor who posted the job.
CREATE POLICY "Involved users can view applications." ON applications
FOR SELECT USING (
  (auth.uid() = freelancer_id) OR
  (EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.contractor_id = auth.uid()
  ))
);

-- This policy allows a user to create an application for themselves.
CREATE POLICY "Users can create their own applications." ON applications
FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

-- This policy allows a freelancer to withdraw (delete) their own application.
CREATE POLICY "Users can delete their own applications." ON applications
FOR DELETE USING (auth.uid() = freelancer_id);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id), 
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for the reviews table.
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- This policy allows anyone to view all reviews.
CREATE POLICY "Reviews are viewable by everyone." ON reviews
FOR SELECT USING (true);

-- This policy allows a user to create a review if:
-- 1. Their ID matches the reviewer_id.
-- AND
-- 2. They were either the contractor or the freelancer for that specific job.
CREATE POLICY "Users involved in a job can create a review." ON reviews
FOR INSERT WITH CHECK (
  (auth.uid() = reviewer_id) AND
  (EXISTS (
    SELECT 1 FROM jobs
    WHERE
      jobs.id = reviews.job_id AND
      (jobs.contractor_id = auth.uid() OR jobs.freelancer_id = auth.uid())
  ))
);