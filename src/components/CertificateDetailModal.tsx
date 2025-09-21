'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  X,
  Calendar,
  User,
  BookOpen,
  Building,
  FileText,
  Tag
} from 'lucide-react'

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

interface CertificateDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: Certificate | null
  previewUrl: string | null
  onApprove: (certificateId: string) => void
  onReject: (certificateId: string) => void
  loading?: boolean
}

export function CertificateDetailModal({
  open,
  onOpenChange,
  certificate,
  previewUrl,
  onApprove,
  onReject,
  loading = false
}: CertificateDetailModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const resetView = () => {
    setZoom(1)
    setRotation(0)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  if (!certificate) return null

  const isPdf = certificate.file_path.toLowerCase().includes('.pdf')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificate Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Certificate Information */}
          <div className="space-y-6">
            {/* Certificate Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Certificate Information</h3>
                <Badge 
                  variant={certificate.status === 'pending' ? 'secondary' : 
                          certificate.status === 'approved' ? 'default' : 'destructive'}
                >
                  {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{certificate.title}</p>
                    <p className="text-sm text-muted-foreground">Certificate Title</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{certificate.issuer}</p>
                    <p className="text-sm text-muted-foreground">Issued By</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{certificate.category}</p>
                    <p className="text-sm text-muted-foreground">Category</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(certificate.issue_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                  </div>
                </div>

                {certificate.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.description}</p>
                      <p className="text-sm text-muted-foreground">Description</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{certificate.student_name}</p>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                  </div>
                </div>

                {certificate.student_roll_no && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.student_roll_no}</p>
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                    </div>
                  </div>
                )}

                {certificate.student_course && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.student_course}</p>
                      <p className="text-sm text-muted-foreground">Course</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(certificate.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(certificate.submitted_at).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Submitted At</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Actions</h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => onApprove(certificate.id)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReject(certificate.id)}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>

          {/* File Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">File Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!previewUrl}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {!isPdf && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-12 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotate}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {previewUrl && (
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                {isPdf ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96"
                    title="Certificate Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-96 overflow-auto">
                    <div 
                      style={{ 
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease-in-out'
                      }}
                    >
                      <Image
                        src={previewUrl}
                        alt="Certificate"
                        width={600}
                        height={400}
                        className="max-w-none"
                        style={{ 
                          width: 'auto',
                          height: 'auto',
                          maxWidth: 'none',
                          maxHeight: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!previewUrl && (
              <div className="border rounded-lg h-96 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}