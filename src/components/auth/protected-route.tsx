'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ROUTE_PATHS } from '@/lib/auth-utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  redirectTo = ROUTE_PATHS.LOGIN 
}: ProtectedRouteProps) {
  const { user, loading, getRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // If user is logged in but shouldn't be on this page (e.g., already logged in trying to access login)
    if (!requireAuth && user) {
      const role = getRole()
      const defaultRedirect = role === 'student' ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.FACULTY_REVIEW
      router.push(defaultRedirect)
      return
    }

    // If specific roles are required
    if (requireAuth && user && allowedRoles.length > 0) {
      const role = getRole()
      if (!role || !allowedRoles.includes(role)) {
        // Redirect to appropriate default page for their role
        const defaultRedirect = role === 'student' ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.FACULTY_REVIEW
        router.push(defaultRedirect)
        return
      }
    }
  }, [user, loading, requireAuth, allowedRoles, redirectTo, router, getRole])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {
    return null
  }

  if (requireAuth && user && allowedRoles.length > 0) {
    const role = getRole()
    if (!role || !allowedRoles.includes(role)) {
      return null
    }
  }

  return <>{children}</>
}