# Credation - Student Certificate Management Platform

A modern web application for managing and verifying student certificates with role-based access control.

## Overview

Credation is a Next.js application that provides a secure platform for students to upload certificates and for faculty to review and approve them. Built with TypeScript, Tailwind CSS, shadcn/ui components, and powered by Supabase.

## Tech Stack

- **Frontend**: Next.js 15.5.3 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components  
- **Backend**: Supabase (Auth, Database, Storage)
- **Authentication**: Supabase Auth with role-based access
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage with signed URLs

## Features

- 🔐 Role-based authentication (Student/Faculty)
- 📄 Certificate upload and management
- ✅ Faculty approval workflow
- 🔒 Secure file storage with access controls
- 📊 Dashboard with student metrics
- 🎨 Modern UI with shadcn/ui components
- 📱 Responsive design

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## Environment Variables

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd credation-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up Supabase database**
   - Go to your Supabase dashboard → SQL Editor
   - Run the contents of `database/schema.sql`
   - Run the contents of `database/storage-setup.sql`

5. **Create test users**
   - Go to Authentication → Users in Supabase dashboard
   - Create users with `role` metadata: `{"role": "student"}` or `{"role": "faculty"}`

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open application**
   - Navigate to http://localhost:3000
   - Test the Supabase connection and authentication

## Project Structure

```
credation-website/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── AuthTest.tsx       # Authentication testing
│   └── lib/                   # Utilities and configurations
│       ├── supabase.ts        # Supabase client
│       ├── utils.ts           # Utility functions
│       └── test-db.ts         # Database testing
├── database/                  # Database configuration
│   ├── schema.sql            # Database schema and RLS policies
│   └── storage-setup.sql     # Storage bucket configuration
├── docs/                     # Documentation
│   └── stories/              # User stories
└── package.json
```

## Database Schema

### Core Tables

- **student_profiles**: Student profile information linked to auth.users
- **certificates**: Certificate data with approval workflow
- **audit_logs**: Audit trail for certificate approvals/rejections

### Key Features

- UUID primary keys for all tables
- Row Level Security (RLS) policies for data protection
- Role-based access control via user metadata
- Audit logging for compliance

## Authentication Flow

1. **Student Access**:
   - Login with email/password
   - View dashboard with metrics
   - Upload certificates
   - Track approval status

2. **Faculty Access**:
   - Login with email/password
   - Review pending certificates
   - Approve/reject with optional notes
   - View audit logs

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Development Workflow

1. **Add shadcn/ui components**:
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **Database changes**:
   - Update SQL files in `database/` folder
   - Apply changes via Supabase SQL Editor
   - Update TypeScript interfaces in `src/lib/supabase.ts`

3. **Testing authentication**:
   - Use the AuthTest component on the homepage
   - Create test users with appropriate role metadata

## Security Considerations

- All database access protected by RLS policies
- File uploads restricted to authenticated users
- Signed URLs for secure file access
- Role-based component rendering
- Environment variables for sensitive configuration

## Next Steps

After completing the initial setup:

1. Implement student dashboard with summary cards
2. Create certificate upload form with file handling
3. Build faculty review dashboard with approval workflow
4. Add real-time notifications for status updates
5. Implement advanced features like bulk actions and search

## Support

For issues and questions:
- Check the documentation in the `docs/` folder
- Review the implementation plan in `IMPLEMENTATION.md`
- Check Supabase setup guide in `SUPABASE_SETUP.md`

## License

MIT License - see LICENSE file for details.