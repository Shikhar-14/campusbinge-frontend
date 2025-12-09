-- Add support for multiple media items in posts
-- Add new column for media items array
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.posts.media_items IS 'Array of media objects: [{url: string, type: "image"|"video"}]. Max 20 items.';

-- Create index for better query performance on media_items
CREATE INDEX IF NOT EXISTS idx_posts_media_items ON public.posts USING GIN (media_items);