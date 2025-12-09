-- Fix: Require authentication to view posts
-- This prevents unauthenticated access to user posts and media URLs

DROP POLICY IF EXISTS "Users can view posts with privacy" ON public.posts;

CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
USING (auth.uid() IS NOT NULL);