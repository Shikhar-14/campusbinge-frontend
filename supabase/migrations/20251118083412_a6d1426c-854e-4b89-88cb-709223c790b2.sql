-- Create awards table
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  cost INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_awards table
CREATE TABLE public.post_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  given_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comment_awards table
CREATE TABLE public.comment_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  given_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reactions table
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type),
  UNIQUE(comment_id, user_id, reaction_type),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE UNIQUE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Add media fields to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', 'link'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS link_preview JSONB;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for awards
CREATE POLICY "Anyone can view awards"
ON public.awards FOR SELECT
USING (true);

-- RLS Policies for post_awards
CREATE POLICY "Anyone can view post awards"
ON public.post_awards FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can give post awards"
ON public.post_awards FOR INSERT
WITH CHECK (auth.uid() = given_by);

-- RLS Policies for comment_awards
CREATE POLICY "Anyone can view comment awards"
ON public.comment_awards FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can give comment awards"
ON public.comment_awards FOR INSERT
WITH CHECK (auth.uid() = given_by);

-- RLS Policies for reactions
CREATE POLICY "Anyone can view reactions"
ON public.reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON public.reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reactions"
ON public.reactions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for polls
CREATE POLICY "Anyone can view polls"
ON public.polls FOR SELECT
USING (true);

CREATE POLICY "Post authors can create polls"
ON public.polls FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_id AND posts.user_id = auth.uid()
  )
);

-- RLS Policies for poll_votes
CREATE POLICY "Anyone can view poll votes"
ON public.poll_votes FOR SELECT
USING (true);

CREATE POLICY "Users can vote on polls"
ON public.poll_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
ON public.poll_votes FOR UPDATE
USING (auth.uid() = user_id);

-- Insert default awards
INSERT INTO public.awards (name, icon, description, cost) VALUES
('Gold', '🥇', 'Show your appreciation with gold', 500),
('Silver', '🥈', 'A silver for good content', 200),
('Bronze', '🥉', 'Bronze for effort', 100),
('Helpful', '🤝', 'This was helpful', 150),
('Wholesome', '🥰', 'Wholesome content', 150),
('Mind Blown', '🤯', 'Mind = blown', 200);

-- Enable realtime for live threads
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;