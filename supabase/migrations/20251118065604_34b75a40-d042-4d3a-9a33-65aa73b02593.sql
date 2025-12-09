-- Create storage bucket for forum media
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-media', 'forum-media', true);

-- Create RLS policies for forum media bucket
CREATE POLICY "Anyone can view forum media"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-media');

CREATE POLICY "Authenticated users can upload forum media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'forum-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own forum media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'forum-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);