-- Rollback script for Supabase Storage Configuration
-- Execute this SQL in Supabase SQL Editor to rollback storage changes

-- Drop all storage policies
DROP POLICY IF EXISTS certificates_delete_own_policy ON storage.objects;
DROP POLICY IF EXISTS certificates_update_own_policy ON storage.objects;
DROP POLICY IF EXISTS certificates_read_faculty_policy ON storage.objects;
DROP POLICY IF EXISTS certificates_read_own_policy ON storage.objects;
DROP POLICY IF EXISTS certificates_upload_policy ON storage.objects;

-- Remove storage bucket (this will also delete all files!)
DELETE FROM storage.buckets WHERE id = 'certificates';

-- WARNING: This will permanently delete all uploaded certificate files
-- Make sure to backup any important files before running this rollback