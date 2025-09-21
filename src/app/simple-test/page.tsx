'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function SimpleTestPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const createData = async () => {
    if (!user?.id) {
      setStatus('Please log in first')
      return
    }

    setStatus('Creating test data...')

    try {
      // Create profile
      await supabase.from('student_profiles').upsert({
        id: user.id,
        roll_no: 'CS2024001',
        course: 'Computer Science',
        credits: 120,
        attendance_percentage: 85.5
      })

      // Create certificates
      await supabase.from('certificates').insert([
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
      ])

      setStatus('✅ Test data created! Go to /dashboard')
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Test Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={createData} className="w-full">
            Create Dashboard Test Data
          </Button>
          
          {status && (
            <div className="p-3 bg-muted rounded text-sm">
              {status}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>After creating test data:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to <a href="/dashboard" className="text-blue-500 underline">/dashboard</a></li>
              <li>You'll see populated summary cards</li>
              <li>3 approved certificates in the table</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}