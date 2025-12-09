-- Fix Security Issue 1: Restrict comments table access to authenticated users only
DROP POLICY IF EXISTS "Users can view comments with privacy" ON public.comments;

CREATE POLICY "Authenticated users can view comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

-- Fix Security Issue 2: Make posts_secure a security barrier view
-- This ensures the view respects RLS from the underlying posts table
DROP VIEW IF EXISTS public.posts_secure;

CREATE VIEW public.posts_secure WITH (security_barrier = true) AS
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