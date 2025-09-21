-- Test queries for audit logging functionality
-- Execute these to verify audit logging is working correctly

-- Test 1: Verify triggers are created
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'certificates';

-- Test 2: Verify functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%audit%' OR routine_name LIKE '%log%';

-- Test 3: Verify views exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%audit%';

-- Test 4: Manual audit log creation test
-- SELECT create_audit_log(
--   'TEST_ACTION',
--   'test_resource',
--   gen_random_uuid(),
--   '{"test": "data"}'::jsonb
-- );

-- Test 5: Certificate submission audit test
-- This should automatically create an audit log when a certificate is inserted
-- INSERT INTO certificates (student_id, title, category, issuer)
-- VALUES (auth.uid(), 'Test Certificate for Audit', 'Test Category', 'Test Issuer');

-- Test 6: Certificate status change audit test
-- This should automatically create an audit log when status is updated
-- UPDATE certificates 
-- SET status = 'approved', 
--     approver_id = auth.uid(), 
--     approved_at = NOW()
-- WHERE title = 'Test Certificate for Audit';

-- Test 7: View recent activities (should show test activities)
SELECT * FROM recent_certificate_activities LIMIT 5;

-- Test 8: Student audit summary test
SELECT * FROM student_audit_summary LIMIT 5;

-- Test 9: Faculty audit summary test  
SELECT * FROM faculty_audit_summary LIMIT 5;

-- Test 10: Verify audit log RLS policies work
-- This should only return audit logs the current user is allowed to see
SELECT 
  id,
  action_type,
  resource_type,
  created_at,
  details->>'certificate_title' as certificate_title
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 11: Audit log statistics
SELECT 
  action_type,
  COUNT(*) as occurrence_count,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM audit_logs
GROUP BY action_type
ORDER BY occurrence_count DESC;

-- Test 12: Daily audit activity summary
SELECT 
  DATE(created_at) as audit_date,
  action_type,
  COUNT(*) as daily_count
FROM audit_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), action_type
ORDER BY audit_date DESC, daily_count DESC;

-- Test 13: Verify trigger performance (should be fast)
EXPLAIN ANALYZE
UPDATE certificates 
SET status = 'pending'
WHERE status = 'pending'
LIMIT 1;

-- Test 14: Audit data integrity check
-- Verify all certificate status changes have corresponding audit logs
SELECT 
  c.id as certificate_id,
  c.status,
  c.approved_at,
  EXISTS(
    SELECT 1 FROM audit_logs al 
    WHERE al.resource_id = c.id 
    AND al.action_type IN ('APPROVE_CERTIFICATE', 'REJECT_CERTIFICATE')
  ) as has_audit_log
FROM certificates c
WHERE c.status IN ('approved', 'rejected');

-- Test 15: Performance test for audit log queries
EXPLAIN ANALYZE
SELECT * FROM audit_logs 
WHERE resource_type = 'certificate' 
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Summary of audit testing
SELECT 
  'AUDIT LOGGING TESTS COMPLETE' as status,
  'Review test results and verify triggers are working' as note,
  NOW() as tested_at;