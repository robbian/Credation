// Test utilities for dashboard functionality
import { supabase } from './supabase'

export interface TestStudentProfile {
  id: string
  roll_no: string
  course: string
  credits: number
  attendance_percentage: number
}

export interface TestCertificate {
  id?: string
  student_id: string
  title: string
  category: string
  issuer: string
  issue_date: string
  status: string
  submitted_at: string
  approved_at?: string
}

export const createTestStudentProfile = async (userId: string): Promise<TestStudentProfile> => {
  const testProfile: TestStudentProfile = {
    id: userId,
    roll_no: 'CS2024001',
    course: 'Computer Science',
    credits: 120,
    attendance_percentage: 85.5
  }

  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(testProfile)
    .select()
    .single()

  if (error) {
    console.error('Error creating test profile:', error)
    throw error
  }

  return data
}

export const createTestCertificates = async (studentId: string): Promise<TestCertificate[]> => {
  const testCertificates: TestCertificate[] = [
    {
      student_id: studentId,
      title: 'React Development Certification',
      category: 'Professional',
      issuer: 'Tech Academy',
      issue_date: '2024-01-15',
      status: 'approved',
      submitted_at: '2024-01-10T10:00:00Z',
      approved_at: '2024-01-16T14:30:00Z'
    },
    {
      student_id: studentId,
      title: 'Data Structures and Algorithms',
      category: 'Academic',
      issuer: 'University of Technology',
      issue_date: '2024-02-20',
      status: 'approved',
      submitted_at: '2024-02-15T09:00:00Z',
      approved_at: '2024-02-22T11:15:00Z'
    },
    {
      student_id: studentId,
      title: 'Machine Learning Project',
      category: 'Project',
      issuer: 'AI Institute',
      issue_date: '2024-03-10',
      status: 'approved',
      submitted_at: '2024-03-05T16:00:00Z',
      approved_at: '2024-03-12T13:45:00Z'
    }
  ]

  const { data, error } = await supabase
    .from('certificates')
    .insert(testCertificates)
    .select()

  if (error) {
    console.error('Error creating test certificates:', error)
    throw error
  }

  return data
}

export const cleanupTestData = async (studentId: string): Promise<void> => {
  // Delete test certificates
  await supabase
    .from('certificates')
    .delete()
    .eq('student_id', studentId)

  // Delete test profile
  await supabase
    .from('student_profiles')
    .delete()
    .eq('id', studentId)
}

export const validateDashboardData = async (studentId: string): Promise<{
  profileExists: boolean
  certificateCount: number
  approvedCertificateCount: number
  projectCount: number
  courseCount: number
}> => {
  // Check if profile exists
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', studentId)
    .single()

  // Get certificate counts
  const { data: allCertificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('student_id', studentId)

  const { data: approvedCertificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'approved')

  const projectCount = (approvedCertificates || []).filter(cert => 
    cert.category?.toLowerCase().includes('project') || 
    cert.title?.toLowerCase().includes('project')
  ).length

  const courseCount = (approvedCertificates || []).filter(cert => 
    cert.category?.toLowerCase().includes('course') || 
    cert.category?.toLowerCase().includes('academic')
  ).length

  return {
    profileExists: !!profile,
    certificateCount: (allCertificates || []).length,
    approvedCertificateCount: (approvedCertificates || []).length,
    projectCount,
    courseCount
  }
}