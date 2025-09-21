import { z } from 'zod'

// Supported file types for certificate uploads
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const certificateFormSchema = z.object({
  title: z.string()
    .min(1, 'Certificate title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  issuer: z.string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must be less than 100 characters'),
  
  issue_date: z.string()
    .min(1, 'Issue date is required')
    .refine((date) => {
      const issueDate = new Date(date)
      const today = new Date()
      return issueDate <= today
    }, 'Issue date cannot be in the future'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 5MB')
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF and image files (JPEG, PNG) are allowed'
    )
})

export type CertificateFormData = z.infer<typeof certificateFormSchema>

// Certificate categories for the select dropdown
export const CERTIFICATE_CATEGORIES = [
  { value: 'academic', label: 'Academic Course' },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'project', label: 'Project Certificate' },
  { value: 'internship', label: 'Internship Certificate' },
  { value: 'workshop', label: 'Workshop/Seminar' },
  { value: 'competition', label: 'Competition/Contest' },
  { value: 'volunteer', label: 'Volunteer Work' },
  { value: 'other', label: 'Other' }
] as const