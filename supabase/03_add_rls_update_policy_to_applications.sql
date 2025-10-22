-- This policy allows the contractor who posted the job to update the application status.
CREATE POLICY "Contractors can update application status for their jobs." ON applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.contractor_id = auth.uid()
  )
);
