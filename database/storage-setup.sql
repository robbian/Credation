-- Supabase Storage Configuration
-- Execute these commands in your Supabase SQL Editor after setting up the schema

-- Create storage bucket for certificates (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates bucket

-- Allow authenticated users to upload files (only in their own folder)
CREATE POLICY certificates_upload_policy ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own files
CREATE POLICY certificates_read_own_policy ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow faculty to read all certificate files
CREATE POLICY certificates_read_faculty_policy ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role') = 'faculty'
    )
  );

-- Allow users to update their own files (before approval)
CREATE POLICY certificates_update_own_policy ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files (before approval)
CREATE POLICY certificates_delete_own_policy ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
