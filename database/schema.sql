-- Credation Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable pgcrypto extension if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Student profiles: one-to-one with auth.users
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  roll_no TEXT,
  course TEXT,
  credits INTEGER DEFAULT 0,
  attendance_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  issuer TEXT,
  issue_date DATE,
  file_path TEXT,
  file_preview_url TEXT,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  blockchain_verified BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approver_id UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_profiles
CREATE POLICY students_can_view_own_profile ON student_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY students_can_insert_own_profile ON student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY students_can_update_own_profile ON student_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for certificates
-- Students can insert certificates for themselves
CREATE POLICY certificates_insert_student ON certificates
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can select their own certificates
CREATE POLICY certificates_select_student ON certificates
  FOR SELECT
  USING (auth.uid() = student_id);

-- Faculty can select pending certificates (simplified - all faculty can see all pending)
CREATE POLICY certificates_select_faculty_pending ON certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND (u.raw_user_meta_data->>'role') = 'faculty'
    )
  );

-- Faculty can update status (approve/reject)
CREATE POLICY certificates_update_faculty ON certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND (u.raw_user_meta_data->>'role') = 'faculty'
    )
  )
  WITH CHECK (
    status IN ('approved','rejected')
  );

-- RLS Policies for audit_logs
-- Users can view audit logs related to their own actions or resources
CREATE POLICY audit_logs_select_own ON audit_logs
  FOR SELECT
  USING (
    auth.uid() = actor_id OR 
    resource_id IN (
      SELECT id FROM certificates WHERE student_id = auth.uid()
    )
  );

-- Faculty and system can insert audit logs
CREATE POLICY audit_logs_insert_faculty ON audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id AND
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND (u.raw_user_meta_data->>'role') IN ('faculty', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_submitted_at ON certificates(submitted_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert some sample data for testing (optional)
-- Note: This will only work after you have users in auth.users table

-- Example: Insert a test student profile (replace with actual user ID)
-- INSERT INTO student_profiles (id, roll_no, course, credits, attendance_percentage)
-- VALUES ('your-test-user-id', 'CS001', 'Computer Science', 120, 85.5);

COMMENT ON TABLE student_profiles IS 'Student profile information linked to auth.users';
COMMENT ON TABLE certificates IS 'Student certificates with approval workflow';
COMMENT ON TABLE audit_logs IS 'Audit trail for certificate approvals and rejections';
