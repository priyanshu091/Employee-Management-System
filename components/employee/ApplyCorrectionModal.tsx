'use client'

import { useState, useCallback } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import InfoBox from '@/components/shared/InfoBox'
import { cn } from '@/lib/utils/cn'

interface FormState {
  date: string
  reason: string
  checkIn: string
  checkOut: string
}

interface FormErrors {
  date?: string
  reason?: string
}

interface ApplyCorrectionModalProps {
  onClose: () => void
  onSubmit: (data: FormState) => void
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function ApplyCorrectionModal({ onClose, onSubmit }: ApplyCorrectionModalProps) {
  // Max date = yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const maxDate = yesterday.toISOString().split('T')[0]

  const [form, setForm] = useState<FormState>({
    date: '', reason: '', checkIn: '', checkOut: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.date)           errs.date   = 'Select the date to correct.'
    if (!form.reason.trim())  errs.reason = 'Enter a reason for the correction.'
    if (form.checkIn && form.checkOut) {
      if (form.checkIn >= form.checkOut) {
        errs.reason = 'Check-in time must be before check-out time.'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    onSubmit(form)
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, onClose, onSubmit])

  return (
    <ModalShell title="Request attendance correction" onClose={onClose} maxWidth="max-w-sm">
      <div className="p-5">
        {/* Date */}
        <FormField label="Date to correct" required error={errors.date}>
          <input
            type="date"
            value={form.date}
            max={maxDate}
            onChange={(e) => set('date', e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>

        {/* Reason */}
        <FormField label="Reason" required error={errors.reason}>
          <textarea
            value={form.reason}
            onChange={(e) => set('reason', e.target.value)}
            rows={2}
            placeholder="Explain what needs to be corrected..."
            className={cn(INPUT_CLASS, 'resize-none')}
          />
        </FormField>

        {/* Optional timings section */}
        <div className="mb-4">
          <p className="text-[12px] text-[#6B7280] mb-2 font-medium">
            Correct timings{' '}
            <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Check-in time" className="mb-0">
              <input
                type="time"
                value={form.checkIn}
                onChange={(e) => set('checkIn', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Check-out time" className="mb-0">
              <input
                type="time"
                value={form.checkOut}
                onChange={(e) => set('checkOut', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
        </div>

        <InfoBox message="Admin will review your request and update the attendance record. This change will be logged in the audit trail." />
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
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-70"
        >
          {loading ? <Spinner /> : 'Submit request'}
        </button>
      </div>
    </ModalShell>
  )
}
