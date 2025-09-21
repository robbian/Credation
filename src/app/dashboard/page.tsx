'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { CertificateUploadForm } from '@/components/CertificateUploadForm'
import { useAuth } from '@/lib/auth-context'
import { USER_ROLES } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { getCertificateFileUrl } from '@/lib/api/certificates'
import { ensureStudentProfile } from '@/lib/profile-utils'
import { useCertificateUpdates } from '@/lib/hooks/useCertificateUpdates'
import { Eye, Download, RefreshCw, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'

interface StudentProfile {
  id: string
  roll_no: string
  course: string
  credits: number
  attendance_percentage: number
}

interface Certificate {
  id: string
  title: string
  category: string
  issuer: string
  issue_date: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  approved_at?: string
  rejection_reason?: string
  file_path: string
}

export default function DashboardPage() {
  const { user, signOut, getRole, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [approvedCertificates, setApprovedCertificates] = useState<Certificate[]>([])
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    if (!user) return
    
    setDataLoading(true)
    try {
      // First, ensure student profile exists
      const profileResult = await ensureStudentProfile(user.id)
      if (!profileResult.success) {
        console.error('Failed to ensure student profile:', profileResult.error)
        toast.error('Failed to initialize student profile. Please refresh the page.')
        return
      }

      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      } else {
        setStudentProfile(profile)
      }

      // Fetch all certificates for the student
      const { data: allCerts, error: allCertsError } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })

      if (allCertsError) {
        console.error('Error fetching all certificates:', allCertsError)
        console.error('Error details:', {
          message: allCertsError.message,
          code: allCertsError.code,
          details: allCertsError.details,
          hint: allCertsError.hint
        })
        
        // If it's an RLS error, suggest creating a student profile
        if (allCertsError.message?.includes('row-level security') || allCertsError.code === 'PGRST301') {
          console.error('RLS policy violation - student profile may not exist')
          toast.error('Access denied. Please ensure you have the correct permissions.')
        }
      } else {
        setAllCertificates(allCerts || [])
        // Filter approved certificates for dashboard display
        const approved = (allCerts || []).filter(cert => cert.status === 'approved')
        setApprovedCertificates(approved)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      toast.error('Failed to load dashboard data. Please refresh the page.')
    } finally {
      setDataLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user && mounted) {
      fetchStudentData()
    }
  }, [user, mounted, fetchStudentData])

  // Real-time certificate updates
  useCertificateUpdates(user?.id, fetchStudentData)

  // Handle certificate preview
  const handleCertificatePreview = async (certificate: Certificate) => {
    try {
      setSelectedCertificate(certificate)
      const url = await getCertificateFileUrl(certificate.file_path)
      if (url) {
        setPreviewUrl(url)
        setPreviewDialogOpen(true)
      } else {
        toast.error('Unable to load certificate preview')
      }
    } catch (error) {
      console.error('Error loading certificate preview:', error)
      toast.error('Error loading certificate preview')
    }
  }

  // Filter and search certificates for approvals tab
  const filteredCertificates = allCertificates.filter(cert => {
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default' // Green
      case 'rejected':
        return 'destructive' // Red
      case 'pending':
        return 'secondary' // Yellow/gray
      default:
        return 'outline'
    }
  }

  // Handle resubmission
  const handleResubmit = (certificate: Certificate) => {
    // Switch to activities tab and pre-populate form (to be implemented in resubmission task)
    setActiveTab('activities')
    toast.info('Please use the upload form to resubmit your certificate')
  }

  useEffect(() => {
    if (!mounted || loading) return

    // Check if user is authenticated and has student role
    if (!user) {
      router.push('/login')
      return
    }

    const role = getRole()
    if (role !== USER_ROLES.STUDENT) {
      // Redirect to appropriate page based on role
      if (role === USER_ROLES.FACULTY) {
        router.push('/faculty')
      } else {
        router.push('/')
      }
      return
    }
  }, [user, getRole, loading, mounted, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Show loading while checking auth
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if user is not student
  if (!user || getRole() !== USER_ROLES.STUDENT) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate metrics from data
  const projectCount = approvedCertificates.filter(cert => 
    cert.category?.toLowerCase().includes('project') || 
    cert.title?.toLowerCase().includes('project')
  ).length

  const courseCount = approvedCertificates.filter(cert => 
    cert.category?.toLowerCase().includes('course') || 
    cert.category?.toLowerCase().includes('academic')
  ).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user?.email || 'Student'} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? <Skeleton className="h-8 w-16" /> : (studentProfile?.credits || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Academic credits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? <Skeleton className="h-8 w-16" /> : `${studentProfile?.attendance_percentage || 0}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">Overall attendance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? <Skeleton className="h-8 w-16" /> : projectCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dataLoading ? <Skeleton className="h-8 w-16" /> : courseCount}
                  </div>
                  <p className="text-xs text-muted-foreground">Academic courses</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Approved Certificates List */}
            <Card>
              <CardHeader>
                <CardTitle>Approved Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : approvedCertificates.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Issuer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedCertificates.map((cert) => (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">{cert.title}</TableCell>
                            <TableCell>{cert.issuer}</TableCell>
                            <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="default">Approved</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No approved certificates yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload your certificates in the Activities tab to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <CertificateUploadForm 
              onUploadSuccess={() => {
                // Refresh data after successful upload
                fetchStudentData()
              }} 
            />
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Certificate Status Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchStudentData}
                    disabled={dataLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Certificates Table */}
                {dataLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCertificates.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCertificates.map((cert) => (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-medium">{cert.title}</p>
                                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{cert.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{new Date(cert.submitted_at).toLocaleDateString()}</p>
                                <p className="text-muted-foreground">
                                  {new Date(cert.submitted_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(cert.status)}>
                                {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {cert.status === 'rejected' && cert.rejection_reason && (
                                <div className="text-sm">
                                  <p className="text-destructive font-medium">Rejected</p>
                                  <p className="text-muted-foreground">{cert.rejection_reason}</p>
                                </div>
                              )}
                              {cert.status === 'approved' && cert.approved_at && (
                                <div className="text-sm">
                                  <p className="text-green-600 font-medium">Approved</p>
                                  <p className="text-muted-foreground">
                                    {new Date(cert.approved_at).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {cert.status === 'pending' && (
                                <div className="text-sm">
                                  <p className="text-orange-600 font-medium">Under Review</p>
                                  <p className="text-muted-foreground">Awaiting faculty approval</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCertificatePreview(cert)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Preview
                                </Button>
                                {cert.status === 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResubmit(cert)}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Resubmit
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {statusFilter !== 'all' 
                        ? `No ${statusFilter} certificates found.`
                        : 'No certificates found.'
                      }
                    </p>
                    {statusFilter !== 'all' && (
                      <Button
                        variant="outline"
                        onClick={() => setStatusFilter('all')}
                        className="mt-2"
                      >
                        Show All Certificates
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCertificate?.title || 'Certificate Preview'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedCertificate && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Issuer:</p>
                          <p className="text-muted-foreground">{selectedCertificate.issuer}</p>
                        </div>
                        <div>
                          <p className="font-medium">Issue Date:</p>
                          <p className="text-muted-foreground">
                            {new Date(selectedCertificate.issue_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Category:</p>
                          <p className="text-muted-foreground">{selectedCertificate.category}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status:</p>
                          <Badge variant={getStatusBadgeVariant(selectedCertificate.status)}>
                            {selectedCertificate.status.charAt(0).toUpperCase() + selectedCertificate.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      {selectedCertificate.description && (
                        <div>
                          <p className="font-medium">Description:</p>
                          <p className="text-muted-foreground">{selectedCertificate.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {previewUrl && (
                    <div className="border rounded-lg overflow-hidden">
                      {selectedCertificate?.file_path.toLowerCase().includes('.pdf') ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-96"
                          title="Certificate Preview"
                        />
                      ) : (
                        <Image
                          src={previewUrl}
                          alt="Certificate"
                          width={800}
                          height={600}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      )}
                    </div>
                  )}
                  
                  {previewUrl && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => window.open(previewUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}