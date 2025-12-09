-- Create a secure view for posts that masks user_id for anonymous posts
CREATE OR REPLACE VIEW public.posts_secure AS
SELECT 
  id,
  content,
  created_at,
  updated_at,
  CASE 
    WHEN is_anonymous = true THEN '00000000-0000-0000-0000-000000000000'::uuid
    ELSE user_id 
  END as user_id,
  is_anonymous,
  anonymous_name,
  college,
  community_id,
  is_pinned,
  is_locked,
  is_archived,
  is_live,
  media_url,
  media_type,
  link_preview
FROM public.posts;

-- Enable RLS on the view
ALTER VIEW public.posts_secure SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.posts_secure TO authenticated, anon;

-- Add index on Aadhaar and PAN columns for student_profiles to support encrypted lookup (preparation for future encryption)
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);

-- Add comment documenting that sensitive fields should be encrypted at application layer
COMMENT ON COLUMN public.student_profiles.aadhaar_number IS 'SENSITIVE: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.pan_number IS 'SENSITIVE: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.phone IS 'SENSITIVE: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.father_phone IS 'SENSITIVE: Should be encrypted at application layer before storage';
COMMENT ON COLUMN public.student_profiles.mother_phone IS 'SENSITIVE: Should be encrypted at application layer before storage';