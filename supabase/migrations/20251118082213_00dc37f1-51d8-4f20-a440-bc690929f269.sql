-- Add karma columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS post_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_karma INTEGER GENERATED ALWAYS AS (post_karma + comment_karma) STORED;

-- Function to calculate user's post karma
CREATE OR REPLACE FUNCTION public.calculate_user_post_karma(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(v.vote_type), 0)::INTEGER
    FROM posts p
    LEFT JOIN votes v ON v.post_id = p.id
    WHERE p.user_id = user_id_param
  );
END;
$$;

-- Function to calculate user's comment karma
CREATE OR REPLACE FUNCTION public.calculate_user_comment_karma(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(cv.vote_type), 0)::INTEGER
    FROM comments c
    LEFT JOIN comment_votes cv ON cv.comment_id = c.id
    WHERE c.user_id = user_id_param
  );
END;
$$;

-- Function to update user karma
CREATE OR REPLACE FUNCTION public.update_user_karma(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_karma_val INTEGER;
  comment_karma_val INTEGER;
BEGIN
  -- Calculate karma
  post_karma_val := calculate_user_post_karma(user_id_param);
  comment_karma_val := calculate_user_comment_karma(user_id_param);
  
  -- Update profile
  UPDATE profiles
  SET 
    post_karma = post_karma_val,
    comment_karma = comment_karma_val
  WHERE user_id = user_id_param;
END;
$$;

-- Trigger function to update karma when votes change
CREATE OR REPLACE FUNCTION public.update_karma_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_user_id UUID;
BEGIN
  -- Get the user_id of the post owner
  SELECT user_id INTO post_user_id
  FROM posts
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  -- Update their karma
  IF post_user_id IS NOT NULL THEN
    PERFORM update_user_karma(post_user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function to update karma when comment votes change
CREATE OR REPLACE FUNCTION public.update_karma_on_comment_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_user_id UUID;
BEGIN
  -- Get the user_id of the comment owner
  SELECT user_id INTO comment_user_id
  FROM comments
  WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
  
  -- Update their karma
  IF comment_user_id IS NOT NULL THEN
    PERFORM update_user_karma(comment_user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for votes
DROP TRIGGER IF EXISTS trigger_update_karma_on_vote ON public.votes;
CREATE TRIGGER trigger_update_karma_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_karma_on_vote();

-- Create triggers for comment votes
DROP TRIGGER IF EXISTS trigger_update_karma_on_comment_vote ON public.comment_votes;
CREATE TRIGGER trigger_update_karma_on_comment_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_karma_on_comment_vote();

-- Initialize karma for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT user_id FROM profiles
  LOOP
    PERFORM update_user_karma(user_record.user_id);
  END LOOP;
END $$;