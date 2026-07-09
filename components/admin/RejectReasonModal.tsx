'use client'

import { useState } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import { INPUT_CLASS } from '@/components/shared/FormField'
import { cn } from '@/lib/utils/cn'

interface RejectReasonModalProps {
  onClose: () => void
  onConfirm: (reason: string) => void
  employeeName: string
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function RejectReasonModal({
  onClose,
  onConfirm,
  employeeName,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Enter a reason for rejection.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    onConfirm(reason.trim())
    onClose()
  }

  return (
    <ModalShell title="Reason for rejection" onClose={onClose} maxWidth="max-w-xs">
      <div className="p-5">
        <p className="text-[12px] text-[#6B7280] mb-3">
          Rejecting request from{' '}
          <span className="font-medium text-[#111827]">{employeeName}</span>
        </p>
        <textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError('') }}
          rows={3}
          placeholder="Give a brief reason..."
          className={cn(INPUT_CLASS, 'resize-none')}
          autoFocus
        />
        {error && (
          <p className="mt-1.5 text-[12px] text-[#DC2626]" role="alert">{error}</p>
        )}
      </div>
      <div className="flex gap-3 px-5 py-4 border-t border-[#F3F4F6]">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg py-2 text-[13px] transition-colors duration-150 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white rounded-lg py-2 text-[13px] font-medium transition-colors duration-150 disabled:opacity-70"
        >
          {loading ? <Spinner /> : 'Reject request'}
        </button>
      </div>
    </ModalShell>
  )
}
