-- Additional Security Hardening for Student Data Protection

-- 1. Add RLS policy to posts_secure view (it's a view, not a table)
-- Views inherit from base table, but we'll explicitly grant access
GRANT SELECT ON public.posts_secure TO authenticated, anon;

-- 2. Tighten notification creation - use service role or specific function
-- Create a function that can be called to create notifications securely
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_actor_id UUID,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Only allow authenticated users to create notifications
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to create notifications';
  END IF;

  INSERT INTO public.notifications (user_id, type, actor_id, post_id, comment_id)
  VALUES (p_user_id, p_type, p_actor_id, p_post_id, p_comment_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- 3. Update community_members policy to be more restrictive
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;
CREATE POLICY "Only community members can view members"
ON public.community_members FOR SELECT
USING (
  -- User can see their own membership
  auth.uid() = user_id
  OR
  -- User is a member of the same community
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
  )
);

-- 4. Add data retention policy for post_views (auto-delete after 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_post_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.post_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a scheduled job comment (actual scheduling would be done via pg_cron or external scheduler)
COMMENT ON FUNCTION public.cleanup_old_post_views IS 
'Run this function weekly to delete post view records older than 90 days for privacy protection';

-- 5. Add data retention policy for audit logs (auto-delete after 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.student_profile_audit
  WHERE accessed_at < NOW() - INTERVAL '1 year';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 
'Run this function monthly to delete audit logs older than 1 year for GDPR compliance';

-- 6. Add application data protection comment
COMMENT ON TABLE public.applications IS 
'SENSITIVE: Contains student application data including fees, decisions, and scholarships. RLS enforces user-only access. Review policies regularly.';

-- 7. Add anonymous interactions protection comment
COMMENT ON TABLE public.anonymous_interactions IS 
'PRIVACY: Maps anonymous_name to user_id. Ensure this data is never correlated with other tables to reveal anonymous identities.';

-- 8. Restrict AI cache to authenticated users only
DROP POLICY IF EXISTS "Public can view cache" ON public.ai_response_cache;
CREATE POLICY "Authenticated users can view cache"
ON public.ai_response_cache FOR SELECT
USING (auth.uid() IS NOT NULL AND expires_at > now());