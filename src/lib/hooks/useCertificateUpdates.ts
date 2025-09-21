import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface CertificateUpdate {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  title: string
  approved_at?: string
  rejection_reason?: string
}

export function useCertificateUpdates(studentId?: string, onUpdate?: () => void) {
  const handleCertificateUpdate = useCallback((payload: any) => {
    const certificate = payload.new as CertificateUpdate
    
    if (certificate.status === 'approved') {
      toast.success(
        `Certificate Approved`,
        {
          description: `Your certificate "${certificate.title}" has been approved by faculty.`,
          duration: 5000,
        }
      )
    } else if (certificate.status === 'rejected') {
      toast.error(
        `Certificate Rejected`,
        {
          description: `Your certificate "${certificate.title}" was rejected. ${
            certificate.rejection_reason ? `Reason: ${certificate.rejection_reason}` : ''
          }`,
          duration: 8000,
        }
      )
    }
    
    // Trigger data refresh if callback provided
    if (onUpdate) {
      onUpdate()
    }
  }, [onUpdate])

  useEffect(() => {
    if (!studentId) return

    const subscription = supabase
      .channel('certificate_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'certificates',
          filter: `student_id=eq.${studentId}`,
        },
        handleCertificateUpdate
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [studentId, handleCertificateUpdate])
}

export function useFacultyCertificateUpdates(onUpdate?: () => void) {
  const handleCertificateChange = useCallback((payload: any) => {
    if (onUpdate) {
      onUpdate()
    }
  }, [onUpdate])

  useEffect(() => {
    const subscription = supabase
      .channel('faculty_certificate_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificates',
        },
        handleCertificateChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [handleCertificateChange])
}