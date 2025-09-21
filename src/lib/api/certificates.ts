import { supabase } from '@/lib/supabase'
import { CertificateFormData } from '@/lib/schemas/certificate-schema'
import { v4 as uuidv4 } from 'uuid'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  success: boolean
  certificateId?: string
  error?: string
}

/**
 * Upload certificate file to Supabase Storage and create certificate record
 */
export async function uploadCertificate(
  studentId: string,
  formData: CertificateFormData,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // First, verify the user is authenticated and has a student profile
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return {
        success: false,
        error: 'You must be logged in to upload certificates'
      }
    }

    // Check if student profile exists
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', studentId)
      .single()

    if (profileError || !profile) {
      console.error('Student profile error:', profileError)
      return {
        success: false,
        error: 'Student profile not found. Please contact support.'
      }
    }

    // Generate unique file name with extension
    const fileExtension = formData.file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `certificates/${studentId}/${fileName}`

    console.log('Uploading file to path:', filePath)

    // Upload file to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, formData.file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return {
        success: false,
        error: `Failed to upload file: ${uploadError.message}`
      }
    }

    console.log('File uploaded successfully, inserting certificate record...')

    // Insert certificate record
    const { data: certificateData, error: insertError } = await supabase
      .from('certificates')
      .insert({
        student_id: studentId,
        title: formData.title,
        category: formData.category,
        issuer: formData.issuer,
        issue_date: formData.issue_date,
        description: formData.description || null,
        file_path: fileData.path,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      
      // Cleanup uploaded file on database error
      await supabase.storage
        .from('certificates')
        .remove([fileData.path])

      return {
        success: false,
        error: `Failed to save certificate record: ${insertError.message}`
      }
    }

    console.log('Certificate record created successfully:', certificateData)

    return {
      success: true,
      certificateId: certificateData.id
    }

  } catch (error) {
    console.error('Upload certificate error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Get signed URL for certificate file
 */
export async function getCertificateFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('certificates')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Get certificate file URL error:', error)
    return null
  }
}