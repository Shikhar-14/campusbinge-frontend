-- Remove security_barrier and create a normal view
-- This will inherit RLS policies from the underlying posts table
DROP VIEW IF EXISTS public.posts_secure;

CREATE VIEW public.posts_secure AS
SELECT 
  id,
  CASE 
    WHEN is_anonymous THEN NULL 
    ELSE user_id 
  END as user_id,
  content,
  anonymous_name,
  college,
  community_id,
  media_type,
  media_url,
  link_preview,
  is_anonymous,
  is_pinned,
  is_locked,
  is_archived,
  is_live,
  created_at,
  updated_at
FROM public.posts;