-- Add father's and mother's email fields to student_profiles table
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS father_email text,
ADD COLUMN IF NOT EXISTS mother_email text;