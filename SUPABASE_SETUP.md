# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/up
2. Create a new project
3. Choose a project name: `credation-mvp`
4. Set a database password (keep it secure)
5. Choose a region close to your users

## Step 2: Get Project Configuration

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJ...` (long string)
   - **Service role key**: `eyJ...` (keep this secret)

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Deploy Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the schema
4. Verify tables are created in the Table Editor

## Step 5: Configure Storage

1. In Supabase dashboard, go to Storage
2. The `certificates` bucket should be created automatically by the schema
3. If not, run the SQL in `database/storage-setup.sql`

## Step 6: Test Connection

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Open http://localhost:3000
4. You should see the Credation homepage with configuration status

## Step 7: Create Test Users

For testing, you'll need to create users with the appropriate roles:

### Test Student User
1. Go to Authentication → Users in Supabase dashboard
2. Create a new user with email/password
3. In the user's metadata, add: `{"role": "student"}`

### Test Faculty User
1. Create another user
2. In the user's metadata, add: `{"role": "faculty"}`

## Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema deployed (3 tables: student_profiles, certificates, audit_logs)
- [ ] RLS policies active
- [ ] Storage bucket `certificates` created
- [ ] Storage policies configured
- [ ] Test users created with role metadata
- [ ] Next.js app runs without errors

## Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check that .env.local is in the project root
- Restart the dev server after changing env vars

### Database Issues
- Ensure all SQL ran without errors
- Check RLS is enabled on all tables
- Verify indexes were created

### Storage Issues
- Confirm bucket exists in Storage section
- Check storage policies in SQL Editor
- Test file upload permissions

## Next Steps

Once setup is complete, you can:
1. Test authentication flow
2. Verify database operations
3. Test file upload to storage
4. Proceed with implementing the student and faculty dashboards