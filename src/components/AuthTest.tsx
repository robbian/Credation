'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthTest() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client-side flag to avoid hydration mismatch
    setIsClient(true)
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Supabase connection error:', error)
          setConnectionStatus('error')
          setError(error.message)
        } else {
          setConnectionStatus('connected')
          setUser(data.session?.user ?? null)
        }
      } catch (err) {
        console.error('Connection test failed:', err)
        setConnectionStatus('error')
        setError('Failed to connect to Supabase')
      } finally {
        setLoading(false)
      }
    }

    testConnection()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
  }

  // Show loading on server and initial client render
  if (!isClient || loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  // Show connection status
  if (connectionStatus === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>❌ Supabase Connection Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">{error}</div>
          <div className="mt-2 text-sm text-gray-600">
            Check your environment variables and Supabase configuration.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectionStatus === 'connected' && user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ Authenticated User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Role:</strong> {user.user_metadata?.role || 'Not set'}</p>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>✅ Supabase Connected - Test Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Note: You need to create test users in Supabase dashboard first.
        </p>
      </CardContent>
    </Card>
  )
}