import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be generated/updated as schema evolves)
export interface StudentProfile {
  id: string
  roll_no?: string
  course?: string
  credits: number
  attendance_percentage: number
  created_at: string
}

export interface Certificate {
  id: string
  student_id: string
  title: string
  category?: string
  issuer?: string
  issue_date?: string
  file_path?: string
  file_preview_url?: string
  status: 'pending' | 'approved' | 'rejected'
  blockchain_verified: boolean
  submitted_at: string
  approved_at?: string
  approver_id?: string
  rejection_reason?: string
}

export interface AuditLog {
  id: string
  actor_id?: string
  action_type?: string
  resource_type?: string
  resource_id?: string
  details?: any
  created_at: string
}