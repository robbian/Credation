'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, X, AlertCircle } from 'lucide-react'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'destructive' ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Check className="h-5 w-5 text-primary" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ApprovalConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificateCount: number
  certificateTitle?: string
  onConfirm: () => void
  loading?: boolean
}

export function ApprovalConfirmationDialog({
  open,
  onOpenChange,
  certificateCount,
  certificateTitle,
  onConfirm,
  loading = false
}: ApprovalConfirmationDialogProps) {
  const isMultiple = certificateCount > 1
  const title = isMultiple 
    ? `Approve ${certificateCount} Certificates?`
    : 'Approve Certificate?'
  
  const description = isMultiple
    ? `You are about to approve ${certificateCount} certificates. This action will mark them as approved and blockchain verified.`
    : `You are about to approve "${certificateTitle}". This action will mark it as approved and blockchain verified.`

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={isMultiple ? 'Approve All' : 'Approve'}
      onConfirm={onConfirm}
      loading={loading}
    />
  )
}

interface RejectionConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificateCount: number
  certificateTitle?: string
  rejectionReason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  loading?: boolean
}

export function RejectionConfirmationDialog({
  open,
  onOpenChange,
  certificateCount,
  certificateTitle,
  rejectionReason,
  onReasonChange,
  onConfirm,
  loading = false
}: RejectionConfirmationDialogProps) {
  const isMultiple = certificateCount > 1
  const title = isMultiple 
    ? `Reject ${certificateCount} Certificates?`
    : 'Reject Certificate?'

  const canConfirm = rejectionReason.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isMultiple
              ? `You are about to reject ${certificateCount} certificates.`
              : `You are about to reject "${certificateTitle}".`}
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {!canConfirm && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A rejection reason is required to proceed.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? 'Processing...' : (isMultiple ? 'Reject All' : 'Reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}