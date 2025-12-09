-- Fix infinite recursion in community_members RLS policy

-- Create a security definer function to check community membership
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id UUID, _community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_members
    WHERE user_id = _user_id
      AND community_id = _community_id
  )
$$;

-- Replace the recursive policy with one using the security definer function
DROP POLICY IF EXISTS "Only community members can view members" ON public.community_members;
CREATE POLICY "Only community members can view members"
ON public.community_members FOR SELECT
USING (
  -- User can see their own membership
  auth.uid() = user_id
  OR
  -- User is a member of the same community (using security definer function to avoid recursion)
  public.is_community_member(auth.uid(), community_id)
);

-- Also update the existing policy name if it exists
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;