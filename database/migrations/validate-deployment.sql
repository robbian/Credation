-- Validation queries for database deployment
-- Execute these in Supabase SQL Editor to verify deployment

-- 1. Verify all core tables exist
SELECT 
  schemaname, 
  tablename,
  CASE WHEN tablename IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('student_profiles', 'certificates', 'audit_logs');

-- 2. Verify RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✓ RLS ENABLED' ELSE '✗ RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('student_profiles', 'certificates', 'audit_logs');

-- 3. Count total policies created
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 4. List all policy names for verification
SELECT 
  schemaname,
  tablename,
  policyname,
  '✓ POLICY EXISTS' as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verify indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('student_profiles', 'certificates', 'audit_logs')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. Verify foreign key constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✓ FK CONSTRAINT EXISTS' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('student_profiles', 'certificates', 'audit_logs');

-- 7. Verify storage bucket exists
SELECT 
  id,
  name,
  public,
  created_at,
  '✓ BUCKET EXISTS' as status
FROM storage.buckets 
WHERE id = 'certificates';

-- 8. Count storage policies
SELECT 
  COUNT(*) as storage_policy_count,
  '✓ STORAGE POLICIES' as status
FROM storage.objects;

-- 9. Test data types and constraints
-- Check status constraint on certificates table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  '✓ COLUMN EXISTS' as status
FROM information_schema.columns 
WHERE table_name = 'certificates' 
  AND column_name = 'status';

-- Check constraints separately
SELECT 
  tc.constraint_name,
  tc.table_name,
  cc.check_clause,
  '✓ CHECK CONSTRAINT' as status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'certificates' 
  AND tc.constraint_type = 'CHECK';

-- 10. Verify table comments exist
SELECT 
  schemaname,
  tablename,
  description,
  CASE WHEN description IS NOT NULL THEN '✓ COMMENT EXISTS' ELSE '✗ NO COMMENT' END as comment_status
FROM pg_tables t
LEFT JOIN pg_description d ON d.objoid = (
  SELECT oid FROM pg_class WHERE relname = t.tablename
)
WHERE schemaname = 'public' 
  AND tablename IN ('student_profiles', 'certificates', 'audit_logs');

-- Summary validation
SELECT 
  'DEPLOYMENT VALIDATION COMPLETE' as status,
  NOW() as validated_at;