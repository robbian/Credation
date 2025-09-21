-- Rollback script for Credation Database Schema
-- Execute this SQL in Supabase SQL Editor to rollback all changes

-- Drop indexes first
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_resource_id;
DROP INDEX IF EXISTS idx_certificates_submitted_at;
DROP INDEX IF EXISTS idx_certificates_status;
DROP INDEX IF EXISTS idx_certificates_student_id;

-- Drop all RLS policies
DROP POLICY IF EXISTS audit_logs_insert_faculty ON audit_logs;
DROP POLICY IF EXISTS audit_logs_select_own ON audit_logs;
DROP POLICY IF EXISTS certificates_update_faculty ON certificates;
DROP POLICY IF EXISTS certificates_select_faculty_pending ON certificates;
DROP POLICY IF EXISTS certificates_select_student ON certificates;
DROP POLICY IF EXISTS certificates_insert_student ON certificates;
DROP POLICY IF EXISTS students_can_update_own_profile ON student_profiles;
DROP POLICY IF EXISTS students_can_insert_own_profile ON student_profiles;
DROP POLICY IF EXISTS students_can_view_own_profile ON student_profiles;

-- Disable RLS
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_profiles DISABLE ROW LEVEL SECURITY;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS student_profiles;

-- Note: Extension pgcrypto is left enabled as it's commonly used
-- To also remove the extension, uncomment the following line:
-- DROP EXTENSION IF EXISTS pgcrypto;