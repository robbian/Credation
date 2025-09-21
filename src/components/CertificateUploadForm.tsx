'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { certificateFormSchema, CertificateFormData, CERTIFICATE_CATEGORIES } from '@/lib/schemas/certificate-schema'
import { uploadCertificate, UploadProgress } from '@/lib/api/certificates'
import { useAuth } from '@/lib/auth-context'

interface CertificateUploadFormProps {
  onUploadSuccess?: () => void
}

export function CertificateUploadForm({ onUploadSuccess }: CertificateUploadFormProps) {
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      title: '',
      category: '',
      issuer: '',
      issue_date: '',
      description: '',
    }
  })

  const selectedFile = form.watch('file')

  const onSubmit = async (data: CertificateFormData) => {
    if (!user) {
      toast.error('You must be logged in to upload certificates')
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)
    
    try {
      const result = await uploadCertificate(
        user.id,
        data,
        (progress) => setUploadProgress(progress)
      )

      if (result.success) {
        setUploadSuccess(true)
        toast.success('Certificate uploaded successfully!', {
          description: 'Your certificate has been submitted for review.'
        })
        form.reset()
        setUploadProgress(null)
        onUploadSuccess?.()
      } else {
        toast.error('Upload failed', {
          description: result.error || 'An unexpected error occurred'
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄'
    if (file.type.startsWith('image/')) return '🖼️'
    return '📋'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Certificate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploadSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Certificate uploaded successfully! It has been submitted for faculty review.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Certificate Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter certificate title"
                      disabled={isUploading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Issuer Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isUploading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CERTIFICATE_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Organization or institution"
                        disabled={isUploading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Issue Date */}
            <FormField
              control={form.control}
              name="issue_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isUploading}
                      max={new Date().toISOString().split('T')[0]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the certificate..."
                      disabled={isUploading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Certificate File *</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            onChange(file)
                          }
                        }}
                        {...field}
                      />
                      
                      {selectedFile && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <span className="text-2xl">{getFileIcon(selectedFile)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, JPEG, PNG. Maximum size: 5MB
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress.percentage)}%</span>
                </div>
                <Progress value={uploadProgress.percentage} className="w-full" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading || !form.formState.isValid}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Certificate
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Upload Guidelines:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Ensure the certificate is clear and readable</li>
            <li>• All required fields must be filled before uploading</li>
            <li>• Files will be reviewed by faculty for approval</li>
            <li>• You&apos;ll receive notifications about the review status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}