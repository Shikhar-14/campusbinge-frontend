-- Ensure private communities can be created
-- Update RLS policy for communities to allow creating private communities

DROP POLICY IF EXISTS "Users can create their own communities" ON public.communities;

CREATE POLICY "Users can create communities"
ON public.communities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Ensure users can view communities they created or are members of
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;

CREATE POLICY "Public communities are viewable by everyone"
ON public.communities FOR SELECT
USING (
  is_private = false 
  OR 
  created_by = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id AND user_id = auth.uid()
  )
);