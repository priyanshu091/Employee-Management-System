'use client'

import { useState, useCallback } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import { cn } from '@/lib/utils/cn'
import type { AttendanceWithProfile } from '@/types'

interface EditAttendanceModalProps {
  row: AttendanceWithProfile
  onClose: () => void
  onSave: (id: string, checkIn: string, checkOut: string, reason: string) => Promise<boolean>
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

function toTimeInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function EditAttendanceModal({ row, onClose, onSave }: EditAttendanceModalProps) {
  const [checkIn, setCheckIn] = useState(toTimeInput(row.check_in))
  const [checkOut, setCheckOut] = useState(toTimeInput(row.check_out))
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<{ reason?: string }>({})
  const [loading, setLoading] = useState(false)

  const handleSave = useCallback(async () => {
    if (!reason.trim()) {
      setErrors({ reason: 'Reason is required — this will be logged in the audit trail.' })
      return
    }
    setLoading(true)
    const ok = await onSave(row.id, checkIn, checkOut, reason)
    setLoading(false)
    if (ok) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, reason, row.id, onClose, onSave])

  return (
    <ModalShell title="Edit attendance" onClose={onClose} maxWidth="max-w-sm">
      <div className="p-5">
        {/* Employee + date subtitle */}
        <p className="text-[12px] text-[#6B7280] mb-4">
          <span className="font-medium text-[#111827]">{row.profile?.full_name}</span>
          {' '}·{' '}{row.date}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Check-in time">
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Check-out time">
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        <FormField label="Reason for change" required error={errors.reason}>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setErrors({}) }}
            rows={2}
            placeholder="Why is this attendance being corrected?"
            className={cn(INPUT_CLASS, 'resize-none')}
            autoFocus
          />
        </FormField>

        {/* Audit trail note */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2.5 mt-1">
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            This change will be permanently recorded in the audit log.
          </p>
        </div>
      </div>

      <div className="flex gap-3 px-5 py-4 border-t border-[#F3F4F6]">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg py-2.5 text-[13px] transition-colors duration-150 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-70"
        >
          {loading ? <Spinner /> : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  )
}
