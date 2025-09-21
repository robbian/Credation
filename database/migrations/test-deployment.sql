-- Test data and queries for validating database deployment
-- Execute after schema deployment to test functionality

-- Test 1: Create sample users (requires actual auth.users entries)
-- This is for reference - actual user creation happens through Supabase Auth

-- Test 2: Test student profile insertion (replace with actual user IDs)
-- INSERT INTO student_profiles (id, roll_no, course, credits, attendance_percentage)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'CS001', 'Computer Science', 120, 85.5);

-- Test 3: Test certificate insertion
-- INSERT INTO certificates (student_id, title, category, issuer, issue_date, status)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001', 
--   'Test Certificate', 
--   'Academic', 
--   'Test Institution', 
--   '2025-01-01', 
--   'pending'
-- );

-- Test 4: Test audit log insertion
-- INSERT INTO audit_logs (actor_id, action_type, resource_type, resource_id, details)
-- VALUES (
--   '00000000-0000-0000-0000-000000000002',
--   'APPROVE',
--   'certificate',
--   (SELECT id FROM certificates LIMIT 1),
--   '{"reason": "Test approval"}'::jsonb
-- );

-- Test queries for RLS validation
-- Note: These should be run with different user contexts

-- Query 1: Test student data isolation
-- Should only return current user's data when run as student
SELECT 
  'Student Profile Access Test' as test_name,
  id,
  roll_no,
  course
FROM student_profiles;

-- Query 2: Test student certificate access
-- Should only return current user's certificates when run as student
SELECT 
  'Student Certificate Access Test' as test_name,
  id,
  title,
  status,
  submitted_at
FROM certificates;

-- Query 3: Test faculty pending certificate access
-- Should return all pending certificates when run as faculty
SELECT 
  'Faculty Pending Certificate Access Test' as test_name,
  id,
  title,
  status,
  submitted_at
FROM certificates 
WHERE status = 'pending';

-- Query 4: Test audit log access
-- Should return relevant audit logs based on user role
SELECT 
  'Audit Log Access Test' as test_name,
  id,
  action_type,
  resource_type,
  created_at
FROM audit_logs;

-- Performance test queries
-- Query 5: Test index usage for student certificate lookup
EXPLAIN ANALYZE
SELECT * FROM certificates 
WHERE student_id = '00000000-0000-0000-0000-000000000001';

-- Query 6: Test index usage for pending certificate lookup
EXPLAIN ANALYZE
SELECT * FROM certificates 
WHERE status = 'pending'
ORDER BY submitted_at DESC;

-- Query 7: Test index usage for audit log lookup
EXPLAIN ANALYZE
SELECT * FROM audit_logs 
WHERE resource_id = '00000000-0000-0000-0000-000000000003'
ORDER BY created_at DESC;

-- Constraint validation tests
-- Query 8: Test invalid status insertion (should fail)
-- INSERT INTO certificates (student_id, title, status)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Invalid Status Test', 'invalid_status');

-- Query 9: Test foreign key constraint (should fail with invalid student_id)
-- INSERT INTO certificates (student_id, title)
-- VALUES ('00000000-0000-0000-0000-999999999999', 'FK Test');

-- Summary of test results
SELECT 
  'DATABASE TESTING COMPLETE' as status,
  'Run individual test queries with appropriate user contexts' as note,
  NOW() as tested_at;