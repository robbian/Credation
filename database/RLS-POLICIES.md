# Row Level Security (RLS) Policy Documentation

## Overview
This document details the RLS policies implemented in the Credation database schema for secure data access control.

## Policy Implementation

### Student Profiles Table Policies

#### 1. students_can_view_own_profile
- **Type**: SELECT policy
- **Purpose**: Students can only view their own profile data
- **Condition**: `auth.uid() = id`
- **Security**: Prevents students from accessing other students' profile information

#### 2. students_can_insert_own_profile
- **Type**: INSERT policy  
- **Purpose**: Students can only create their own profile
- **Condition**: `auth.uid() = id`
- **Security**: Prevents unauthorized profile creation

#### 3. students_can_update_own_profile
- **Type**: UPDATE policy
- **Purpose**: Students can only update their own profile
- **Condition**: `auth.uid() = id` (both USING and WITH CHECK)
- **Security**: Prevents profile tampering by other users

### Certificates Table Policies

#### 1. certificates_insert_student
- **Type**: INSERT policy
- **Purpose**: Students can only insert certificates for themselves
- **Condition**: `auth.uid() = student_id`
- **Security**: Prevents students from creating certificates for others

#### 2. certificates_select_student
- **Type**: SELECT policy
- **Purpose**: Students can only view their own certificates
- **Condition**: `auth.uid() = student_id`
- **Security**: Ensures data isolation between students

#### 3. certificates_select_faculty_pending
- **Type**: SELECT policy
- **Purpose**: Faculty can view all pending certificates for review
- **Condition**: Checks user role in metadata = 'faculty'
- **Security**: Role-based access control for certificate review

#### 4. certificates_update_faculty
- **Type**: UPDATE policy
- **Purpose**: Faculty can approve/reject certificates
- **Conditions**: 
  - USING: User role = 'faculty'
  - WITH CHECK: Status only changeable to 'approved' or 'rejected'
- **Security**: Restricts status changes to authorized faculty only

### Audit Logs Table Policies

#### 1. audit_logs_select_own
- **Type**: SELECT policy
- **Purpose**: Users can view audit logs for their own actions or certificates
- **Condition**: 
  - `auth.uid() = actor_id` OR
  - `resource_id` relates to user's own certificates
- **Security**: Maintains audit trail visibility for relevant users

#### 2. audit_logs_insert_faculty
- **Type**: INSERT policy
- **Purpose**: Faculty can create audit log entries
- **Conditions**:
  - User is the actor (`auth.uid() = actor_id`)
  - User role is 'faculty' or 'admin'
- **Security**: Ensures only authorized users can create audit trails

## Role-Based Access Control

### User Role Detection
All policies use the pattern: `(u.raw_user_meta_data->>'role') = 'faculty'`
- Role information stored in Supabase user metadata
- Consistent role checking across all policies
- Future-proof for additional roles (admin, etc.)

### Access Matrix

| User Type | Student Profiles | Own Certificates | All Certificates | Audit Logs |
|-----------|------------------|------------------|------------------|------------|
| Student   | Own only         | Own only         | Own only         | Own only   |
| Faculty   | None*            | None*            | Pending only     | Own + Related |
| Admin     | TBD              | TBD              | TBD              | All        |

*Faculty don't directly access student profiles or individual certificates except through the review process

## Testing RLS Policies

### Student Access Tests
1. Create student user with role metadata
2. Insert student profile and certificates
3. Verify isolation from other student data
4. Test certificate status visibility

### Faculty Access Tests
1. Create faculty user with role metadata
2. Verify access to pending certificates only
3. Test approval/rejection operations
4. Verify audit log creation

### Security Validation
1. Attempt cross-user data access (should fail)
2. Test role elevation attempts (should fail)
3. Validate policy bypass attempts (should fail)
4. Test malformed role metadata handling

## Policy Maintenance

### Adding New Policies
1. Follow naming convention: `tablename_action_role`
2. Use consistent role checking patterns
3. Include both USING and WITH CHECK where applicable
4. Test thoroughly with different user contexts

### Updating Policies
1. Use `DROP POLICY` followed by `CREATE POLICY`
2. Test policy changes in development first
3. Document policy changes in migration files
4. Validate security implications

## Security Considerations

### Current Implementation
- ✅ Data isolation between students
- ✅ Role-based faculty access
- ✅ Audit trail protection
- ✅ Status change restrictions

### Future Enhancements
- Institute-level faculty restrictions
- Granular permission system
- Policy versioning and rollback
- Performance optimization for large datasets

## Troubleshooting

### Common Issues
1. **Policy Not Working**: Check user authentication and role metadata
2. **Access Denied**: Verify policy conditions match user context
3. **Performance Issues**: Add indexes for policy condition columns
4. **Role Detection Fails**: Validate metadata JSON structure

### Debug Queries
```sql
-- Check current user context
SELECT auth.uid(), auth.role();

-- Check user metadata
SELECT raw_user_meta_data FROM auth.users WHERE id = auth.uid();

-- Test policy conditions manually
SELECT EXISTS (
  SELECT 1 FROM auth.users u 
  WHERE u.id = auth.uid() 
  AND (u.raw_user_meta_data->>'role') = 'faculty'
);
```