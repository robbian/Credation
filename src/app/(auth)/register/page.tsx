'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/lib/auth-context'
import { USER_ROLES, ROUTE_PATHS } from '@/lib/auth-utils'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['student', 'faculty'], {
    required_error: 'Please select your role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const { signUp } = useAuth()
  const router = useRouter()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setError('')
    setSuccess('')
    
    const { error: signUpError } = await signUp(data.email, data.password, data.role)
    
    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setSuccess('Account created successfully! Please check your email to verify your account.')
    
    // Redirect to login after successful registration
    setTimeout(() => {
      router.push(ROUTE_PATHS.LOGIN)
    }, 2000)
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex items-center justify-center min-h-screen bg-background relative py-8">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md mx-4 border-border">
          <CardHeader className="space-y-4">
            {/* Credation Logo */}
            <div className="flex justify-center">
              <Link href="/">
                <Image
                  src="/logo/credation-logo_final.png"
                  alt="Credation Logo"
                  width={250}
                  height={65}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Create your account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Join Credation to manage your certificates
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="bg-input border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          className="bg-input border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          className="bg-input border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-foreground">I am a:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.STUDENT} id="student" />
                            <Label htmlFor="student" className="text-foreground">Student</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.FACULTY} id="faculty" />
                            <Label htmlFor="faculty" className="text-foreground">Faculty</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/90 underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}