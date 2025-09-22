'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function TestDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState('')
  const [validation, setValidation] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return
    
    if (!user) {
      router.push('/login')
      return
    }
  }, [user, loading, mounted, router])

  const createTestData = async () => {
    if (!user) {
      setStatus('Please log in first')
      return
    }

    try {
      setStatus('Creating test data...')
      
      // Create test profile
      const testProfile = {
        id: user.id,
        roll_no: 'CS2024001',
        course: 'Computer Science',
        credits: 120,
        attendance_percentage: 85.5
      }

      const { error: profileError } = await supabase
        .from('student_profiles')
        .upsert(testProfile)

      if (profileError) {
        throw profileError
      }

      setStatus('Test profile created...')
      
      // Create test certificates
      const testCertificates = [
        {
          student_id: user.id,
          title: 'React Development Certification',
          category: 'Professional',
          issuer: 'Tech Academy',
          issue_date: '2024-01-15',
          status: 'approved',
          submitted_at: '2024-01-10T10:00:00Z',
          approved_at: '2024-01-16T14:30:00Z'
        },
        {
          student_id: user.id,
          title: 'Data Structures and Algorithms',
          category: 'Academic',
          issuer: 'University of Technology',
          issue_date: '2024-02-20',
          status: 'approved',
          submitted_at: '2024-02-15T09:00:00Z',
          approved_at: '2024-02-22T11:15:00Z'
        },
        {
          student_id: user.id,
          title: 'Machine Learning Project',
          category: 'Project',
          issuer: 'AI Institute',
          issue_date: '2024-03-10',
          status: 'approved',
          submitted_at: '2024-03-05T16:00:00Z',
          approved_at: '2024-03-12T13:45:00Z'
        }
      ]

      const { error: certsError } = await supabase
        .from('certificates')
        .insert(testCertificates)

      if (certsError) {
        throw certsError
      }

      setStatus('Test data created successfully! Go to /dashboard to see it.')
      
    } catch (error: any) {
      setStatus(`Error: ${error.message || error}`)
      console.error('Test data creation failed:', error)
    }
  }

  const cleanupData = async () => {
    if (!user) {
      setStatus('Please log in first')
      return
    }

    try {
      setStatus('Cleaning up test data...')
      
      // Delete test certificates
      await supabase
        .from('certificates')
        .delete()
        .eq('student_id', user.id)

      // Delete test profile
      await supabase
        .from('student_profiles')
        .delete()
        .eq('id', user.id)

      setStatus('Test data cleaned up successfully!')
      setValidation(null)
    } catch (error: any) {
      setStatus(`Error: ${error.message || error}`)
      console.error('Cleanup failed:', error)
    }
  }

  const validateData = async () => {
    if (!user) {
      setStatus('Please log in first')
      return
    }

    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get certificate counts
      const { data: allCertificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user.id)

      const { data: approvedCertificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'approved')

      const projectCount = (approvedCertificates || []).filter(cert => 
        cert.category?.toLowerCase().includes('project') || 
        cert.title?.toLowerCase().includes('project')
      ).length

      const courseCount = (approvedCertificates || []).filter(cert => 
        cert.category?.toLowerCase().includes('course') || 
        cert.category?.toLowerCase().includes('academic')
      ).length

      const result = {
        profileExists: !!profile,
        certificateCount: (allCertificates || []).length,
        approvedCertificateCount: (approvedCertificates || []).length,
        projectCount,
        courseCount
      }

      setValidation(result)
      setStatus('Data validation complete')
    } catch (error: any) {
      setStatus(`Error: ${error.message || error}`)
      console.error('Validation failed:', error)
    }
  }

  // Show loading while checking auth
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Test Utilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={createTestData}>
                Create Test Data
              </Button>
              <Button onClick={validateData} variant="outline">
                Validate Data
              </Button>
              <Button onClick={cleanupData} variant="destructive">
                Cleanup Test Data
              </Button>
            </div>

            {status && (
              <div className="p-4 bg-muted rounded-lg">
                <p>{status}</p>
              </div>
            )}

            {validation && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Validation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>Profile exists: {validation.profileExists ? '✅' : '❌'}</li>
                    <li>Total certificates: {validation.certificateCount}</li>
                    <li>Approved certificates: {validation.approvedCertificateCount}</li>
                    <li>Project count: {validation.projectCount}</li>
                    <li>Course count: {validation.courseCount}</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click &quot;Create Test Data&quot; to populate your account with sample data</li>
                  <li>Go to <a href="/dashboard" className="text-blue-500 underline">/dashboard</a> to see the populated dashboard</li>
                  <li>Use &quot;Validate Data&quot; to check what data exists</li>
                  <li>Use &quot;Cleanup Test Data&quot; to remove test data when done</li>
                </ol>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}