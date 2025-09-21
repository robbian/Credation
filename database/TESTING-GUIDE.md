# Database Testing and Validation Guide

## Overview
This guide provides comprehensive testing procedures to validate the complete database configuration for the Credation platform.

## Pre-Testing Setup

### Required Test Users
Create test users with proper roles in Supabase Auth:

1. **Student Test User**
   - Email: `student-test@example.com`
   - Role metadata: `{"role": "student"}`
   - Purpose: Test student data access and isolation

2. **Faculty Test User**
   - Email: `faculty-test@example.com`
   - Role metadata: `{"role": "faculty"}`
   - Purpose: Test faculty review capabilities

3. **Additional Student User**
   - Email: `student2-test@example.com`
   - Role metadata: `{"role": "student"}`
   - Purpose: Test data isolation between students

## Test Categories

### 1. Student Data Isolation Testing

#### Test 1.1: Student Profile Access
```sql
-- Run as student-test@example.com
-- Should only return current user's profile
SELECT id, roll_no, course FROM student_profiles;

-- Expected: Only records where id = current user's auth.uid()
-- Should NOT see other students' profiles
```

#### Test 1.2: Certificate Access Isolation
```sql
-- Run as student-test@example.com
-- Should only return current user's certificates
SELECT id, title, status, student_id FROM certificates;

-- Expected: Only certificates where student_id = current user's auth.uid()
```

#### Test 1.3: Cross-User Data Access (Should Fail)
```sql
-- Run as student-test@example.com
-- Attempt to insert certificate for another user (should fail)
INSERT INTO certificates (student_id, title) 
VALUES ('other-student-uuid', 'Unauthorized Certificate');

-- Expected: INSERT should fail due to RLS policy
```

### 2. Faculty Access Testing

#### Test 2.1: Faculty Pending Certificate Access
```sql
-- Run as faculty-test@example.com
-- Should return all pending certificates
SELECT id, title, status, student_id FROM certificates WHERE status = 'pending';

-- Expected: All pending certificates visible regardless of student
```

#### Test 2.2: Faculty Approval Workflow
```sql
-- Run as faculty-test@example.com
-- Update certificate status to approved
UPDATE certificates 
SET status = 'approved', 
    approver_id = auth.uid(), 
    approved_at = NOW()
WHERE id = 'test-certificate-uuid' AND status = 'pending';

-- Expected: UPDATE should succeed and create audit log
```

#### Test 2.3: Faculty Rejection Workflow
```sql
-- Run as faculty-test@example.com
-- Update certificate status to rejected
UPDATE certificates 
SET status = 'rejected', 
    approver_id = auth.uid(), 
    rejection_reason = 'Test rejection reason'
WHERE id = 'test-certificate-uuid' AND status = 'pending';

-- Expected: UPDATE should succeed and create audit log
```

### 3. Storage Policy Testing

#### Test 3.1: Student File Upload
```javascript
// Run as authenticated student
const { data, error } = await supabase.storage
  .from('certificates')
  .upload(`${user.id}/test-certificate.pdf`, file);

// Expected: Upload should succeed to own folder
// Should fail when attempting to upload to another user's folder
```

#### Test 3.2: Faculty File Access
```javascript
// Run as authenticated faculty
const { data, error } = await supabase.storage
  .from('certificates')
  .createSignedUrl(`${student_id}/certificate.pdf`, 3600);

// Expected: Should succeed for any student's files
```

#### Test 3.3: Storage Access Violation
```javascript
// Run as student A, attempt to access student B's files
const { data, error } = await supabase.storage
  .from('certificates')
  .download(`${other_student_id}/certificate.pdf`);

// Expected: Should fail with access denied error
```

### 4. Audit Logging Testing

#### Test 4.1: Automatic Audit Log Creation
```sql
-- Insert a test certificate (should create submission audit log)
INSERT INTO certificates (student_id, title, category) 
VALUES (auth.uid(), 'Test Audit Certificate', 'Test');

-- Check if audit log was created
SELECT * FROM audit_logs 
WHERE action_type = 'SUBMIT_CERTIFICATE' 
  AND resource_id = (SELECT id FROM certificates WHERE title = 'Test Audit Certificate');
```

#### Test 4.2: Status Change Audit Logs
```sql
-- Update certificate status (should create status change audit log)
UPDATE certificates 
SET status = 'approved', approver_id = auth.uid(), approved_at = NOW()
WHERE title = 'Test Audit Certificate';

-- Check if audit log was created
SELECT * FROM audit_logs 
WHERE action_type = 'APPROVE_CERTIFICATE' 
  AND details->>'certificate_title' = 'Test Audit Certificate';
```

#### Test 4.3: Audit Log Access Control
```sql
-- Run as student user
-- Should only see audit logs related to own certificates
SELECT id, action_type, resource_type, created_at FROM audit_logs;

-- Run as faculty user
-- Should see audit logs for own actions
SELECT id, action_type, resource_type, created_at FROM audit_logs;
```

### 5. Performance Testing

#### Test 5.1: Index Performance
```sql
-- Test student certificate lookup performance
EXPLAIN ANALYZE
SELECT * FROM certificates WHERE student_id = auth.uid();

-- Expected: Should use idx_certificates_student_id index
```

#### Test 5.2: Status Query Performance
```sql
-- Test pending certificate lookup performance
EXPLAIN ANALYZE
SELECT * FROM certificates WHERE status = 'pending' ORDER BY submitted_at DESC;

-- Expected: Should use idx_certificates_status index
```

#### Test 5.3: Audit Log Query Performance
```sql
-- Test audit log lookup performance
EXPLAIN ANALYZE
SELECT * FROM audit_logs 
WHERE resource_id = 'test-uuid' 
ORDER BY created_at DESC;

-- Expected: Should use idx_audit_logs_resource_id index
```

## Test Execution Checklist

### Pre-Deployment Testing
- [ ] Schema deployment successful without errors
- [ ] All tables created with correct structure
- [ ] All indexes created successfully
- [ ] RLS enabled on all required tables
- [ ] All policies created without syntax errors

### Student Access Testing
- [ ] Student can access only own profile data
- [ ] Student can access only own certificates
- [ ] Student cannot access other students' data
- [ ] Student can upload files to own folder only
- [ ] Student cannot access other students' files

### Faculty Access Testing
- [ ] Faculty can view all pending certificates
- [ ] Faculty can approve/reject certificates
- [ ] Faculty can access all certificate files
- [ ] Faculty actions create proper audit logs
- [ ] Faculty cannot perform unauthorized operations

### Security Testing
- [ ] RLS policies prevent unauthorized data access
- [ ] Storage policies prevent unauthorized file access
- [ ] Cross-user data access attempts fail properly
- [ ] Role-based access control works correctly
- [ ] Audit logs capture all required actions

### Performance Testing
- [ ] Index usage verified for common queries
- [ ] Query performance within acceptable limits
- [ ] No significant performance degradation
- [ ] Audit logging doesn't impact performance
- [ ] Storage operations perform efficiently

### Data Integrity Testing
- [ ] Foreign key constraints work correctly
- [ ] Check constraints prevent invalid data
- [ ] Triggers execute without errors
- [ ] Audit logs maintain referential integrity
- [ ] Data consistency maintained across operations

## Test Data Management

### Creating Test Data
```sql
-- Create test student profiles (run as respective users)
INSERT INTO student_profiles (id, roll_no, course, credits, attendance_percentage)
VALUES (auth.uid(), 'TEST001', 'Computer Science', 100, 85.0);

-- Create test certificates
INSERT INTO certificates (student_id, title, category, issuer, issue_date)
VALUES 
  (auth.uid(), 'Test Certificate 1', 'Academic', 'Test University', '2025-01-01'),
  (auth.uid(), 'Test Certificate 2', 'Professional', 'Test Company', '2025-01-15');
```

### Cleaning Test Data
```sql
-- Clean up test data after testing
DELETE FROM audit_logs WHERE details->>'certificate_title' LIKE 'Test%';
DELETE FROM certificates WHERE title LIKE 'Test%';
DELETE FROM student_profiles WHERE roll_no LIKE 'TEST%';
```

## Automated Testing Scripts

### Database Validation Script
```bash
#!/bin/bash
# validate-database.sh
# Run comprehensive database validation

echo "Running database validation tests..."

# Test 1: Check table existence
psql -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('student_profiles', 'certificates', 'audit_logs');"

# Test 2: Check RLS status
psql -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('student_profiles', 'certificates', 'audit_logs');"

# Test 3: Check policy count
psql -c "SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname='public';"

echo "Database validation complete."
```

## Troubleshooting Common Issues

### Test Failures and Solutions

#### Issue: RLS Policy Not Working
- **Symptoms**: Users can access data they shouldn't
- **Solution**: Check user authentication and role metadata
- **Debug**: Verify `auth.uid()` and role values

#### Issue: Storage Policy Errors
- **Symptoms**: File upload/download fails unexpectedly
- **Solution**: Check bucket configuration and policy syntax
- **Debug**: Verify folder structure and authentication

#### Issue: Audit Logs Not Created
- **Symptoms**: No audit logs for certificate operations
- **Solution**: Check trigger installation and function syntax
- **Debug**: Test trigger functions manually

#### Issue: Performance Problems
- **Symptoms**: Slow query execution
- **Solution**: Verify index usage and optimize queries
- **Debug**: Use EXPLAIN ANALYZE for query plans

## Reporting Test Results

### Test Report Template
```
# Database Testing Report

## Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Warnings: X

## Test Results by Category
### Student Data Isolation: PASS/FAIL
### Faculty Access Control: PASS/FAIL
### Storage Security: PASS/FAIL
### Audit Logging: PASS/FAIL
### Performance: PASS/FAIL

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Open/Resolved
   - Action Required: [Description]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Sign-off
Tested by: [Name]
Date: [Date]
Status: Ready for Production / Requires Fixes
```