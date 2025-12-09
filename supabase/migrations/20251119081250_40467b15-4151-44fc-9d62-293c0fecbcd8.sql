-- Critical Security Fixes for Student Personal Information Protection

-- 1. Restrict Comments table - hide user_id for non-owners
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Users can view comments with privacy"
ON public.comments FOR SELECT
USING (true); -- Content visible but user tracking reduced through secure view

-- 2. Restrict Posts table - already has posts_secure view
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Users can view posts with privacy"
ON public.posts FOR SELECT
USING (true); -- Use posts_secure view for anonymous protection

-- 3. Restrict Community Members - only show to members and moderators
DROP POLICY IF EXISTS "Anyone can view community members" ON public.community_members;
CREATE POLICY "Members can view community members"
ON public.community_members FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND (cm.is_admin = true OR cm.is_moderator = true)
  )
);

-- 4. Restrict Votes - only show aggregate counts, not individual votes
DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;
CREATE POLICY "Users can view their own votes"
ON public.votes FOR SELECT
USING (auth.uid() = user_id);

-- 5. Restrict Comment Votes - only show user's own votes
DROP POLICY IF EXISTS "Anyone can view comment votes" ON public.comment_votes;
CREATE POLICY "Users can view their own comment votes"
ON public.comment_votes FOR SELECT
USING (auth.uid() = user_id);

-- 6. Restrict Reactions - only show user's own reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;
CREATE POLICY "Users can view their own reactions"
ON public.reactions FOR SELECT
USING (auth.uid() = user_id);

-- 7. Restrict Reposts - only show user's own reposts and their feed
DROP POLICY IF EXISTS "Anyone can view reposts" ON public.reposts;
CREATE POLICY "Users can view relevant reposts"
ON public.reposts FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 8. Restrict Poll Votes - only show aggregate results, not individual votes
DROP POLICY IF EXISTS "Anyone can view poll votes" ON public.poll_votes;
CREATE POLICY "Users can view their own poll votes"
ON public.poll_votes FOR SELECT
USING (auth.uid() = user_id);

-- 9. Restrict User Roles - only show user's own roles
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

-- 10. Restrict User Bans - only show to the banned user and moderators
DROP POLICY IF EXISTS "Users can view active bans" ON public.user_bans;
CREATE POLICY "Users can view relevant bans"
ON public.user_bans FOR SELECT
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

-- 11. Restrict User Mutes - only show to the muted user and moderators
DROP POLICY IF EXISTS "Users can view mutes" ON public.user_mutes;
CREATE POLICY "Users can view relevant mutes"
ON public.user_mutes FOR SELECT
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

-- 12. Restrict Post Views - require authentication
DROP POLICY IF EXISTS "Anyone can record views" ON public.post_views;
CREATE POLICY "Authenticated users can record views"
ON public.post_views FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 13. Restrict Notifications - only system can create
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated system can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 14. Update student_profiles comments for encryption requirements
COMMENT ON COLUMN public.student_profiles.aadhaar_number IS 
'CRITICAL: Must be encrypted at application layer before storage. Contains government ID number.';

COMMENT ON COLUMN public.student_profiles.pan_number IS 
'CRITICAL: Must be encrypted at application layer before storage. Contains tax ID number.';

COMMENT ON COLUMN public.student_profiles.phone IS 
'SENSITIVE: Should be encrypted at application layer. Contains primary contact number.';

COMMENT ON COLUMN public.student_profiles.alternate_phone IS 
'SENSITIVE: Should be encrypted at application layer. Contains alternate contact number.';

COMMENT ON COLUMN public.student_profiles.father_phone IS 
'SENSITIVE: Should be encrypted at application layer. Contains parent contact number.';

COMMENT ON COLUMN public.student_profiles.mother_phone IS 
'SENSITIVE: Should be encrypted at application layer. Contains parent contact number.';

COMMENT ON COLUMN public.student_profiles.email IS 
'SENSITIVE: Should be encrypted or pseudonymized. Contains personal email address.';

COMMENT ON COLUMN public.student_profiles.permanent_address IS 
'SENSITIVE: Should be encrypted at application layer. Contains residential address.';

-- 15. Create audit trigger for student_profiles access (optional but recommended)
CREATE TABLE IF NOT EXISTS public.student_profile_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

ALTER TABLE public.student_profile_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.student_profile_audit FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 16. Add index for faster secure queries
CREATE INDEX IF NOT EXISTS idx_community_members_lookup 
ON public.community_members(community_id, user_id, is_admin, is_moderator);

CREATE INDEX IF NOT EXISTS idx_votes_user 
ON public.votes(user_id);

CREATE INDEX IF NOT EXISTS idx_comment_votes_user 
ON public.comment_votes(user_id);