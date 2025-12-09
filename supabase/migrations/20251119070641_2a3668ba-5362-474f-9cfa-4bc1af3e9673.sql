-- Create shortlisted_colleges table
CREATE TABLE IF NOT EXISTS public.shortlisted_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  college_id TEXT NOT NULL,
  college_name TEXT NOT NULL,
  college_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, college_id)
);

-- Enable RLS
ALTER TABLE public.shortlisted_colleges ENABLE ROW LEVEL SECURITY;

-- Users can view their own shortlisted colleges
CREATE POLICY "Users can view their own shortlisted colleges"
ON public.shortlisted_colleges
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their shortlist
CREATE POLICY "Users can add to their shortlist"
ON public.shortlisted_colleges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their shortlist
CREATE POLICY "Users can remove from their shortlist"
ON public.shortlisted_colleges
FOR DELETE
USING (auth.uid() = user_id);