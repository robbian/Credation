import { supabase } from '@/lib/supabase'

export interface AuditLogEntry {
  actor_id: string
  action_type: 'approve' | 'reject' | 'bulk_approve' | 'bulk_reject'
  resource_type: 'certificate'
  resource_id: string
  details: Record<string, any>
}

export async function logAuditEntry(entry: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: entry.actor_id,
        action_type: entry.action_type,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: entry.details
      })

    if (error) {
      console.error('Error logging audit entry:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in audit logging:', error)
    return { success: false, error: 'Failed to log audit entry' }
  }
}

export async function logCertificateApproval(
  actorId: string,
  certificateId: string,
  certificateTitle: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  return logAuditEntry({
    actor_id: actorId,
    action_type: 'approve',
    resource_type: 'certificate',
    resource_id: certificateId,
    details: {
      certificate_title: certificateTitle,
      student_name: studentName,
      timestamp: new Date().toISOString()
    }
  })
}

export async function logCertificateRejection(
  actorId: string,
  certificateId: string,
  certificateTitle: string,
  rejectionReason: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  return logAuditEntry({
    actor_id: actorId,
    action_type: 'reject',
    resource_type: 'certificate',
    resource_id: certificateId,
    details: {
      certificate_title: certificateTitle,
      student_name: studentName,
      rejection_reason: rejectionReason,
      timestamp: new Date().toISOString()
    }
  })
}

export async function logBulkCertificateApproval(
  actorId: string,
  certificateIds: string[],
  certificates: Array<{ id: string; title: string; student_name?: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const auditEntries = certificates.map(cert => ({
      actor_id: actorId,
      action_type: 'bulk_approve' as const,
      resource_type: 'certificate' as const,
      resource_id: cert.id,
      details: {
        certificate_title: cert.title,
        student_name: cert.student_name,
        bulk_operation: true,
        bulk_count: certificateIds.length,
        timestamp: new Date().toISOString()
      }
    }))

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntries)

    if (error) {
      console.error('Error logging bulk audit entries:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in bulk audit logging:', error)
    return { success: false, error: 'Failed to log bulk audit entries' }
  }
}

export async function logBulkCertificateRejection(
  actorId: string,
  certificateIds: string[],
  certificates: Array<{ id: string; title: string; student_name?: string }>,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auditEntries = certificates.map(cert => ({
      actor_id: actorId,
      action_type: 'bulk_reject' as const,
      resource_type: 'certificate' as const,
      resource_id: cert.id,
      details: {
        certificate_title: cert.title,
        student_name: cert.student_name,
        rejection_reason: rejectionReason,
        bulk_operation: true,
        bulk_count: certificateIds.length,
        timestamp: new Date().toISOString()
      }
    }))

    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEntries)

    if (error) {
      console.error('Error logging bulk rejection audit entries:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in bulk rejection audit logging:', error)
    return { success: false, error: 'Failed to log bulk rejection audit entries' }
  }
}