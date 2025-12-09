-- Drop old tables
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comment_vibes CASCADE;
DROP TABLE IF EXISTS public.comment_reposts CASCADE;

-- Create votes table for posts (replacing likes)
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comment_votes table (replacing comment_vibes)
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for comment_votes
CREATE POLICY "Anyone can view comment votes"
  ON public.comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on comments"
  ON public.comment_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment votes"
  ON public.comment_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment votes"
  ON public.comment_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get post vote score
CREATE OR REPLACE FUNCTION public.get_post_vote_score(post_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(vote_type), 0)::INTEGER
    FROM votes
    WHERE post_id = post_id_param
  );
END;
$$;

-- Function to get comment vote score
CREATE OR REPLACE FUNCTION public.get_comment_vote_score(comment_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(vote_type), 0)::INTEGER
    FROM comment_votes
    WHERE comment_id = comment_id_param
  );
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON public.votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_id ON public.comment_votes(user_id);