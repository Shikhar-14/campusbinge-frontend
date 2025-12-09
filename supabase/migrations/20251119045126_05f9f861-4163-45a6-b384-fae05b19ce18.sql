-- Create storage bucket for profile documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-documents',
  'profile-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for profile-documents bucket
CREATE POLICY "Users can upload their own profile documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);