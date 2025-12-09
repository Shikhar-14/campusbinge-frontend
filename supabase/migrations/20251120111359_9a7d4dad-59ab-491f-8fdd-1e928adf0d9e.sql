-- Fix 1: Drop posts_secure view as it's creating security concerns
-- The main posts table with RLS is sufficient
DROP VIEW IF EXISTS public.posts_secure CASCADE;

-- Fix 2: Restrict profiles to be viewable only by the owner
-- Remove the overly permissive "all authenticated users" policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 3: Add audit logging for student_profiles access
CREATE TABLE IF NOT EXISTS public.student_profile_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  accessed_by uuid NOT NULL,
  accessed_at timestamptz DEFAULT now(),
  access_type text NOT NULL, -- 'view', 'update', 'export', etc.
  ip_address text
);

ALTER TABLE public.student_profile_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.student_profile_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.student_profile_audit
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add comments to sensitive PII fields in student_profiles
COMMENT ON COLUMN public.student_profiles.aadhaar_number IS 'SENSITIVE PII: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.pan_number IS 'SENSITIVE PII: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.phone IS 'SENSITIVE PII: Consider encryption at application layer';
COMMENT ON COLUMN public.student_profiles.email IS 'SENSITIVE PII: Consider encryption at application layer';
COMMENT ON COLUMN public.student_profiles.father_phone IS 'SENSITIVE PII: Consider encryption at application layer';
COMMENT ON COLUMN public.student_profiles.mother_phone IS 'SENSITIVE PII: Consider encryption at application layer';
COMMENT ON COLUMN public.student_profiles.permanent_address IS 'SENSITIVE PII: Consider encryption at application layer';