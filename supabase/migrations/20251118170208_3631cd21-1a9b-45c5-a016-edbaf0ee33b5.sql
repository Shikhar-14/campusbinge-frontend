-- Add new fields to student_profiles table for enhanced profile data

-- Add school names for 10th and 12th
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS tenth_school_name text,
ADD COLUMN IF NOT EXISTS twelfth_school_name text;

-- Change twelfth_stream to twelfth_subjects to store array of subjects
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS twelfth_subjects text[] DEFAULT ARRAY[]::text[];

-- Add entrance exam other specify field
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS entrance_exam_other_specify text;

-- Add father and mother phone numbers with country codes
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS father_phone text,
ADD COLUMN IF NOT EXISTS father_phone_country_code text DEFAULT '+91',
ADD COLUMN IF NOT EXISTS mother_phone text,
ADD COLUMN IF NOT EXISTS mother_phone_country_code text DEFAULT '+91';

-- Add comment for documentation
COMMENT ON COLUMN public.student_profiles.twelfth_subjects IS 'Array of subjects studied in Class 12';
COMMENT ON COLUMN public.student_profiles.entrance_exam_other_specify IS 'Entrance exam name when Other is selected';