# Credation Database Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Credation database schema and storage configuration to Supabase.

## Prerequisites
- Access to your Supabase project dashboard
- SQL Editor access in Supabase
- Project ID: `egmnbhskdhijlvibnnvl`

## Deployment Steps

### Phase 1: Core Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Execute `database/schema.sql` in the following order:
   - Extension creation
   - Table creation (student_profiles, certificates, audit_logs)
   - RLS enablement
   - Policy creation
   - Index creation

### Phase 2: Storage Configuration
1. In Supabase SQL Editor, execute `database/storage-setup.sql`:
   - Bucket creation
   - Storage policy deployment

### Phase 3: Validation
Run the validation queries in `database/migrations/validate-deployment.sql`

## Rollback Procedures

### Emergency Rollback
If deployment fails or needs to be reverted:

1. **Storage Rollback**: Execute `database/rollbacks/rollback-storage.sql`
   - ⚠️ WARNING: This deletes all uploaded files
2. **Schema Rollback**: Execute `database/rollbacks/rollback-schema.sql`

### Partial Rollback
For specific components:
- RLS Policies only: Use policy-specific DROP statements
- Tables only: Use table-specific DROP statements
- Storage only: Use storage rollback script

## Validation Checklist

### After Schema Deployment
- [ ] All 3 tables created (student_profiles, certificates, audit_logs)
- [ ] RLS enabled on all tables
- [ ] All policies created without errors
- [ ] Indexes created successfully
- [ ] Foreign key constraints working

### After Storage Deployment
- [ ] Certificates bucket created
- [ ] Storage policies active
- [ ] File upload test successful
- [ ] Role-based access working

## Testing Strategy

### Database Testing
1. Create test users with different roles (student/faculty)
2. Test data isolation between users
3. Verify RLS policy enforcement
4. Test foreign key constraints

### Storage Testing
1. Test file upload as student
2. Test file access as faculty
3. Verify folder-based permissions
4. Test file deletion restrictions

## Troubleshooting

### Common Issues
1. **Policy Creation Errors**: Check user metadata field names match exactly
2. **Index Creation Fails**: Verify table exists before creating indexes
3. **Storage Bucket Exists**: Use ON CONFLICT in bucket creation
4. **Permission Denied**: Ensure user has sufficient Supabase permissions

### Verification Queries
```sql
-- Check tables exist
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('student_profiles', 'certificates', 'audit_logs');

-- Check RLS enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('student_profiles', 'certificates', 'audit_logs');

-- Check policies exist
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'certificates';
```

## Migration History
- 2025-09-19: Initial schema deployment (v1.0)
- Schema includes: student_profiles, certificates, audit_logs
- Storage includes: certificates bucket with RLS policies

## Security Notes
- All tables have RLS enabled by default
- Storage policies enforce folder-based access control
- Audit logs track all certificate status changes
- Role-based access uses `raw_user_meta_data->>'role'` pattern

## Performance Considerations
- Indexes created on frequently queried columns
- Query optimization for student data isolation
- Efficient faculty pending certificate queries
- Audit log retention strategy (future consideration)