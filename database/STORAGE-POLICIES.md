# Supabase Storage Configuration Documentation

## Overview
This document details the storage bucket configuration and policies for secure file management in the Credation platform.

## Storage Bucket Configuration

### Certificates Bucket
- **Bucket ID**: `certificates`
- **Bucket Name**: `certificates`
- **Public Access**: `false` (private bucket)
- **Purpose**: Store student certificate files with role-based access control

### Folder Structure
```
certificates/
├── {student_id_1}/
│   ├── {uuid_1}.pdf
│   ├── {uuid_2}.jpg
│   └── ...
├── {student_id_2}/
│   ├── {uuid_3}.pdf
│   └── ...
└── ...
```

## Storage Policies

### 1. certificates_upload_policy (INSERT)
- **Purpose**: Allow students to upload files to their own folder only
- **Conditions**:
  - Bucket must be 'certificates'
  - User must be authenticated
  - Folder name must match user's UUID: `(storage.foldername(name))[1] = auth.uid()::text`
- **Security**: Prevents students from uploading to other users' folders

### 2. certificates_read_own_policy (SELECT)
- **Purpose**: Allow students to read their own uploaded files
- **Conditions**:
  - Bucket must be 'certificates'
  - User must be authenticated
  - Folder name must match user's UUID
- **Security**: Ensures students can only access their own files

### 3. certificates_read_faculty_policy (SELECT)
- **Purpose**: Allow faculty to read all certificate files for review
- **Conditions**:
  - Bucket must be 'certificates'
  - User must be authenticated
  - User role must be 'faculty' in metadata
- **Security**: Role-based access for certificate review process

### 4. certificates_update_own_policy (UPDATE)
- **Purpose**: Allow students to update their own files (before approval)
- **Conditions**:
  - Bucket must be 'certificates'
  - User must be authenticated
  - Folder name must match user's UUID
- **Security**: Prevents unauthorized file modifications

### 5. certificates_delete_own_policy (DELETE)
- **Purpose**: Allow students to delete their own files (before approval)
- **Conditions**:
  - Bucket must be 'certificates'
  - User must be authenticated
  - Folder name must match user's UUID
- **Security**: Prevents unauthorized file deletion

## File Upload Workflow

### Student Upload Process
1. Student authenticates and receives JWT token
2. Client generates unique filename: `{student_id}/{uuid}.{extension}`
3. Upload request sent with proper headers and authentication
4. Storage policy validates folder access based on auth.uid()
5. File stored in user's designated folder

### Faculty Access Process
1. Faculty authenticates with role metadata
2. Client requests file access for certificate review
3. Storage policy validates faculty role in user metadata
4. Signed URL generated for secure file access
5. Faculty can view file through secure, time-limited URL

## Security Features

### Folder-Based Isolation
- Each student gets their own folder: `/certificates/{student_id}/`
- Students cannot access files outside their folder
- Faculty can access all folders for review purposes

### Role-Based Access Control
- Student role: Own folder only (read/write/delete)
- Faculty role: All folders (read-only for review)
- Admin role: TBD (future implementation)

### Signed URLs
- All file access uses signed URLs with time-limited access
- URLs automatically expire for security
- No direct file access without proper authentication

## File Management

### Supported File Types
- PDF documents (.pdf)
- Image files (.jpg, .jpeg, .png)
- Document files (.doc, .docx)
- Future: Additional formats as needed

### File Size Limits
- Maximum file size: TBD (configure in Supabase dashboard)
- Recommended: 10MB per file for optimal performance
- Large files should be compressed before upload

### File Naming Convention
- Pattern: `{timestamp}_{original_name}.{extension}`
- UUID generation ensures unique filenames
- Original filename preserved in database metadata

## Testing Storage Policies

### Student Upload Test
```javascript
// Test student file upload
const { data, error } = await supabase.storage
  .from('certificates')
  .upload(`${user.id}/${uuid()}.pdf`, file)
```

### Faculty Access Test
```javascript
// Test faculty file access
const { data, error } = await supabase.storage
  .from('certificates')
  .createSignedUrl(`${student_id}/${filename}`, 3600)
```

### Access Violation Test
```javascript
// Test unauthorized access (should fail)
const { data, error } = await supabase.storage
  .from('certificates')
  .upload(`${other_user_id}/${uuid()}.pdf`, file)
```

## Performance Considerations

### File Organization
- Folder-based structure prevents large directory listings
- UUID filenames avoid naming conflicts
- Hierarchical organization scales with user growth

### Caching Strategy
- Signed URLs can be cached temporarily
- File metadata cached in application layer
- Preview generation cached for performance

### Storage Optimization
- Regular cleanup of orphaned files
- Compression for large documents
- CDN integration for global access (future)

## Monitoring and Maintenance

### Storage Metrics
- Monitor bucket storage usage
- Track file upload/download patterns
- Alert on unusual access patterns

### Policy Maintenance
- Regular security audits of storage policies
- Policy updates for new file types
- Access pattern analysis for optimization

### Backup Strategy
- Regular backup of critical certificate files
- Disaster recovery procedures
- Data retention policy compliance

## Troubleshooting

### Common Issues
1. **Upload Failed**: Check authentication and folder permissions
2. **Access Denied**: Verify user role and file ownership
3. **File Not Found**: Confirm file path and bucket configuration
4. **Policy Error**: Validate policy syntax and conditions

### Debug Queries
```sql
-- Check storage bucket configuration
SELECT * FROM storage.buckets WHERE id = 'certificates';

-- List storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'certificates';

-- Check file permissions for specific user
SELECT * FROM storage.objects 
WHERE bucket_id = 'certificates' 
AND name LIKE 'user_id/%';
```

## Future Enhancements

### Planned Features
- File versioning for certificate updates
- Bulk file operations for faculty
- Advanced file type validation
- Malware scanning integration
- Automated file archiving

### Security Improvements
- Enhanced access logging
- File integrity verification
- Encrypted storage options
- Advanced threat detection