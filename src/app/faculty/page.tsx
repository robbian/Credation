'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/lib/auth-context'
import { USER_ROLES } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { getCertificateFileUrl } from '@/lib/api/certificates'
import { CERTIFICATE_CATEGORIES } from '@/lib/schemas/certificate-schema'
import { 
  logCertificateApproval, 
  logCertificateRejection, 
  logBulkCertificateApproval, 
  logBulkCertificateRejection 
} from '@/lib/utils/auditLogger'
import { useFacultyCertificateUpdates } from '@/lib/hooks/useCertificateUpdates'
import { ApprovalConfirmationDialog, RejectionConfirmationDialog } from '@/components/ConfirmationDialogs'
import { CertificateDetailModal } from '@/components/CertificateDetailModal'
import { 
  Search, Filter, Eye, Check, X, Clock, Users, 
  FileText, Calendar, ChevronLeft, ChevronRight,
  CheckSquare, Square, AlertCircle, Download
} from 'lucide-react'
import { toast } from 'sonner'

interface Certificate {
  id: string
  title: string
  category: string
  issuer: string
  issue_date: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  file_path: string
  student_id: string
  student_name?: string
  student_roll_no?: string
  student_course?: string
}

interface DashboardStats {
  pendingCount: number
  approvedToday: number
  totalProcessed: number
}

const ITEMS_PER_PAGE = 10

export default function FacultyPage() {
  const { user, signOut, getRole, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Data state
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<DashboardStats>({ pendingCount: 0, approvedToday: 0, totalProcessed: 0 })
  const [dataLoading, setDataLoading] = useState(true)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Selection state
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch certificates and stats
  const fetchData = useCallback(async () => {
    if (!user) return
    
    setDataLoading(true)
    try {
      // Fetch all certificates with student information
      const { data: certsData, error: certsError } = await supabase
        .from('certificates')
        .select(`
          *,
          student_profiles (
            roll_no,
            course
          )
        `)
        .order('submitted_at', { ascending: false })

      if (certsError) {
        console.error('Error fetching certificates:', certsError)
        toast.error('Failed to load certificates')
        return
      }

      // Transform data to include student name and details
      const transformedCerts: Certificate[] = (certsData || []).map(cert => ({
        ...cert,
        student_name: cert.student_profiles?.roll_no || 'Unknown Student',
        student_roll_no: cert.student_profiles?.roll_no,
        student_course: cert.student_profiles?.course
      }))

      setCertificates(transformedCerts)

      // Calculate stats
      const pending = transformedCerts.filter(cert => cert.status === 'pending')
      const today = new Date().toDateString()
      const approvedToday = transformedCerts.filter(cert => 
        cert.status === 'approved' && 
        new Date(cert.submitted_at).toDateString() === today
      )
      const processed = transformedCerts.filter(cert => cert.status !== 'pending')

      setStats({
        pendingCount: pending.length,
        approvedToday: approvedToday.length,
        totalProcessed: processed.length
      })

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setDataLoading(false)
    }
  }, [user])

  // Filter and search logic
  useEffect(() => {
    let filtered = certificates

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(cert => cert.category === categoryFilter)
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(cert => new Date(cert.submitted_at) >= filterDate)
          break
        case 'week':
          filterDate.setDate(today.getDate() - 7)
          filtered = filtered.filter(cert => new Date(cert.submitted_at) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter(cert => new Date(cert.submitted_at) >= filterDate)
          break
      }
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter)
    }

    setFilteredCertificates(filtered)
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
    setCurrentPage(1)
  }, [certificates, searchQuery, categoryFilter, dateFilter, statusFilter])

  // Pagination logic
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Selection logic
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedCertificates(new Set(paginatedCertificates.map(cert => cert.id)))
    } else {
      setSelectedCertificates(new Set())
    }
  }

  const handleSelectCertificate = (certificateId: string, checked: boolean) => {
    const newSelected = new Set(selectedCertificates)
    if (checked) {
      newSelected.add(certificateId)
    } else {
      newSelected.delete(certificateId)
    }
    setSelectedCertificates(newSelected)
    setSelectAll(newSelected.size === paginatedCertificates.length)
  }

  // Enhanced preview functionality
  const handleDetailView = async (certificate: Certificate) => {
    try {
      setSelectedCertificate(certificate)
      const url = await getCertificateFileUrl(certificate.file_path)
      if (url) {
        setPreviewUrl(url)
        setDetailModalOpen(true)
      } else {
        toast.error('Unable to load certificate preview')
      }
    } catch (error) {
      console.error('Error loading detail view:', error)
      toast.error('Error loading certificate details')
    }
  }

  // Confirmation dialog handlers
  const handleApprovalConfirmation = (certificateIds: string[]) => {
    setSelectedCertificates(new Set(certificateIds))
    setApprovalDialogOpen(true)
  }

  const handleRejectionConfirmation = (certificateIds: string[]) => {
    setSelectedCertificates(new Set(certificateIds))
    setRejectDialogOpen(true)
  }

  // Real-time updates
  useFacultyCertificateUpdates(fetchData)

  // Approval/Rejection logic
  const handleApprove = async (certificateIds: string[]) => {
    setProcessingAction(true)
    try {
      // Get certificate details for audit logging
      const certificatesToApprove = certificates.filter(cert => 
        certificateIds.includes(cert.id)
      )

      const { error } = await supabase
        .from('certificates')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approver_id: user?.id,
          blockchain_verified: true
        })
        .in('id', certificateIds)

      if (error) {
        throw error
      }

      // Log audit entries
      if (user?.id) {
        if (certificateIds.length === 1) {
          const cert = certificatesToApprove[0]
          await logCertificateApproval(
            user.id,
            cert.id,
            cert.title,
            cert.student_name
          )
        } else {
          await logBulkCertificateApproval(
            user.id,
            certificateIds,
            certificatesToApprove.map(cert => ({
              id: cert.id,
              title: cert.title,
              student_name: cert.student_name
            }))
          )
        }
      }

      toast.success(`${certificateIds.length} certificate(s) approved successfully`)
      setSelectedCertificates(new Set())
      setSelectAll(false)
      setApprovalDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error approving certificates:', error)
      toast.error('Failed to approve certificates')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleReject = async (certificateIds: string[], reason: string) => {
    setProcessingAction(true)
    try {
      // Get certificate details for audit logging
      const certificatesToReject = certificates.filter(cert => 
        certificateIds.includes(cert.id)
      )

      const { error } = await supabase
        .from('certificates')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approver_id: user?.id
        })
        .in('id', certificateIds)

      if (error) {
        throw error
      }

      // Log audit entries
      if (user?.id) {
        if (certificateIds.length === 1) {
          const cert = certificatesToReject[0]
          await logCertificateRejection(
            user.id,
            cert.id,
            cert.title,
            reason,
            cert.student_name
          )
        } else {
          await logBulkCertificateRejection(
            user.id,
            certificateIds,
            certificatesToReject.map(cert => ({
              id: cert.id,
              title: cert.title,
              student_name: cert.student_name
            })),
            reason
          )
        }
      }

      toast.success(`${certificateIds.length} certificate(s) rejected`)
      setSelectedCertificates(new Set())
      setSelectAll(false)
      setRejectDialogOpen(false)
      setRejectionReason('')
      await fetchData()
    } catch (error) {
      console.error('Error rejecting certificates:', error)
      toast.error('Failed to reject certificates')
    } finally {
      setProcessingAction(false)
    }
  }

  // Auth check
  useEffect(() => {
    if (!mounted || loading) return

    if (!user) {
      router.push('/login')
      return
    }

    const role = getRole()
    if (role !== USER_ROLES.FACULTY) {
      if (role === USER_ROLES.STUDENT) {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
      return
    }

    fetchData()
  }, [user, getRole, loading, mounted, router, fetchData])

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

  // Don't render if user is not faculty
  if (!user || getRole() !== USER_ROLES.FACULTY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user?.email || 'Faculty'} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'F'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Faculty Review Dashboard</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.pendingCount}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.approvedToday}
              </div>
              <p className="text-xs text-muted-foreground">Today&apos;s approvals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.totalProcessed}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Certificate Reviews
              {statusFilter === 'pending' && ` - Pending`}
              {statusFilter === 'approved' && ` - Approved`}
              {statusFilter === 'rejected' && ` - Rejected`}
              {statusFilter === 'all' && ` - All`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates, students, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CERTIFICATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>

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
            </div>

            {/* Bulk Actions */}
            {selectedCertificates.size > 0 && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedCertificates.size} certificate(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprovalConfirmation(Array.from(selectedCertificates))}
                    disabled={processingAction}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectionConfirmation(Array.from(selectedCertificates))}
                    disabled={processingAction}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            )}

            {/* Certificates Table */}
            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCertificates.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCertificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCertificates.has(cert.id)}
                              onCheckedChange={(checked) => 
                                handleSelectCertificate(cert.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{cert.student_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cert.student_course}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
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
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDetailView(cert)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprovalConfirmation([cert.id])}
                                disabled={processingAction}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectionConfirmation([cert.id])}
                                disabled={processingAction}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredCertificates.length)} of{' '}
                      {filteredCertificates.length} certificates
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== 'all' || dateFilter !== 'all'
                    ? 'No certificates match your current filters.'
                    : 'No pending certificates to review.'
                  }
                </p>
                {(searchQuery || categoryFilter !== 'all' || dateFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setDateFilter('all')
                      setStatusFilter('pending')
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Certificate Detail Modal */}
        <CertificateDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          certificate={selectedCertificate}
          previewUrl={previewUrl}
          onApprove={(id) => {
            handleApprovalConfirmation([id])
            setDetailModalOpen(false)
          }}
          onReject={(id) => {
            handleRejectionConfirmation([id])
            setDetailModalOpen(false)
          }}
          loading={processingAction}
        />

        {/* Basic Preview Dialog (for backward compatibility) */}
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
                      <p className="font-medium">Student:</p>
                      <p className="text-muted-foreground">{selectedCertificate.student_name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Course:</p>
                      <p className="text-muted-foreground">{selectedCertificate.student_course}</p>
                    </div>
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
                      <p className="font-medium">Submitted:</p>
                      <p className="text-muted-foreground">
                        {new Date(selectedCertificate.submitted_at).toLocaleDateString()}
                      </p>
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
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (selectedCertificate) {
                          handleApprovalConfirmation([selectedCertificate.id])
                          setPreviewDialogOpen(false)
                        }
                      }}
                      disabled={processingAction}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedCertificate) {
                          handleRejectionConfirmation([selectedCertificate.id])
                          setPreviewDialogOpen(false)
                        }
                      }}
                      disabled={processingAction}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Approval Confirmation Dialog */}
        <ApprovalConfirmationDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          certificateCount={selectedCertificates.size}
          certificateTitle={selectedCertificates.size === 1 ? selectedCertificate?.title : undefined}
          onConfirm={() => handleApprove(Array.from(selectedCertificates))}
          loading={processingAction}
        />

        {/* Rejection Confirmation Dialog */}
        <RejectionConfirmationDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          certificateCount={selectedCertificates.size}
          certificateTitle={selectedCertificates.size === 1 ? selectedCertificate?.title : undefined}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={() => handleReject(Array.from(selectedCertificates), rejectionReason)}
          loading={processingAction}
        />
      </div>
    </div>
  )
}