'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getRedirectPath } from '@/lib/auth-utils'
import LandingPage from '@/components/LandingPage'

export default function HomePage() {
  const { user, loading, getRole } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && user && mounted) {
      // User is logged in, redirect to their role-specific page
      const role = getRole()
      const redirectPath = getRedirectPath(role)
      router.push(redirectPath)
    }
  }, [user, loading, getRole, router, mounted])

  // Show loading until mounted and auth is checked
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is logged in, they'll be redirected
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show landing page for unauthenticated users
  return <LandingPage />
}