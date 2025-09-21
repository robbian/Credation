-- Audit logging utilities and triggers
-- Execute after main schema deployment

-- Function to automatically create audit logs for certificate status changes
CREATE OR REPLACE FUNCTION log_certificate_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when status actually changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO audit_logs (
      actor_id,
      action_type,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      CASE 
        WHEN NEW.status = 'approved' THEN 'APPROVE_CERTIFICATE'
        WHEN NEW.status = 'rejected' THEN 'REJECT_CERTIFICATE'
        ELSE 'UPDATE_CERTIFICATE_STATUS'
      END,
      'certificate',
      NEW.id,
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'approver_id', NEW.approver_id,
        'approved_at', NEW.approved_at,
        'rejection_reason', NEW.rejection_reason,
        'student_id', NEW.student_id,
        'certificate_title', NEW.title
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for certificate status changes
CREATE TRIGGER certificate_audit_trigger
  AFTER UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION log_certificate_status_change();

-- Function to log certificate submissions
CREATE OR REPLACE FUNCTION log_certificate_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Log certificate submission
  INSERT INTO audit_logs (
    actor_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'SUBMIT_CERTIFICATE',
    'certificate',
    NEW.id,
    jsonb_build_object(
      'student_id', NEW.student_id,
      'certificate_title', NEW.title,
      'category', NEW.category,
      'issuer', NEW.issuer,
      'issue_date', NEW.issue_date,
      'submitted_at', NEW.submitted_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for certificate submissions
CREATE TRIGGER certificate_submission_audit_trigger
  AFTER INSERT ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION log_certificate_submission();

-- Function to manually create audit logs (for use in application code)
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for common audit queries

-- View: Recent certificate activities
CREATE VIEW recent_certificate_activities AS
SELECT 
  al.id,
  al.action_type,
  al.created_at,
  al.details->>'certificate_title' as certificate_title,
  al.details->>'previous_status' as previous_status,
  al.details->>'new_status' as new_status,
  u.email as actor_email,
  al.resource_id as certificate_id
FROM audit_logs al
JOIN auth.users u ON u.id = al.actor_id
WHERE al.resource_type = 'certificate'
ORDER BY al.created_at DESC;

-- View: Student audit summary (for students to see their own activity)
CREATE VIEW student_audit_summary AS
SELECT 
  al.id,
  al.action_type,
  al.created_at,
  al.details->>'certificate_title' as certificate_title,
  al.details->>'new_status' as status,
  c.student_id
FROM audit_logs al
JOIN certificates c ON c.id = al.resource_id
WHERE al.resource_type = 'certificate'
  AND c.student_id = auth.uid()
ORDER BY al.created_at DESC;

-- View: Faculty audit summary (for faculty to see their review activity)
CREATE VIEW faculty_audit_summary AS
SELECT 
  al.id,
  al.action_type,
  al.created_at,
  al.details->>'certificate_title' as certificate_title,
  al.details->>'new_status' as status,
  al.details->>'student_id' as student_id,
  al.actor_id as faculty_id
FROM audit_logs al
WHERE al.resource_type = 'certificate'
  AND al.actor_id = auth.uid()
  AND al.action_type IN ('APPROVE_CERTIFICATE', 'REJECT_CERTIFICATE')
ORDER BY al.created_at DESC;

-- Grant appropriate permissions for the views
-- Note: RLS policies on audit_logs table will still apply

-- Comments for documentation
COMMENT ON FUNCTION log_certificate_status_change() IS 'Automatically logs certificate status changes for audit trail';
COMMENT ON FUNCTION log_certificate_submission() IS 'Automatically logs certificate submissions for audit trail';
COMMENT ON FUNCTION create_audit_log(TEXT, TEXT, UUID, JSONB) IS 'Manual function to create audit log entries from application code';
COMMENT ON VIEW recent_certificate_activities IS 'Recent certificate activities across all users (respects RLS)';
COMMENT ON VIEW student_audit_summary IS 'Student-specific audit trail view';
COMMENT ON VIEW faculty_audit_summary IS 'Faculty-specific audit trail view';