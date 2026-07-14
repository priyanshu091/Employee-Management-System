'use client'

import { useState, useCallback } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import InfoBox from '@/components/shared/InfoBox'
import { cn } from '@/lib/utils/cn'

interface FormState {
  date: string
  reason: string
}

interface FormErrors {
  date?: string
  reason?: string
}

import { getTodayIST } from '@/lib/utils/time'

interface ApplyWFHModalProps {
  onClose: () => void
  onSubmit: (data: FormState) => void
  checkedInToday?: boolean
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function ApplyWFHModal({ onClose, onSubmit, checkedInToday }: ApplyWFHModalProps) {
  const today = getTodayIST()

  const [form, setForm] = useState<FormState>({ date: '', reason: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.date)           errs.date   = 'Select a date.'
    if (!form.reason.trim())  errs.reason = 'Enter a reason.'
    if (form.date === today && checkedInToday) {
      errs.date = 'You are already checked into the office today. You cannot submit a WFH request for today.'
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
    <ModalShell title="Request work from home" onClose={onClose} maxWidth="max-w-sm">
      <div className="p-5">
        <FormField label="Date" required error={errors.date}>
          <input
            type="date"
            value={form.date}
            min={today}
            onChange={(e) => set('date', e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label="Reason" required error={errors.reason}>
          <textarea
            value={form.reason}
            onChange={(e) => set('reason', e.target.value)}
            rows={3}
            placeholder="Why do you need to work from home?"
            className={cn(INPUT_CLASS, 'resize-none')}
          />
        </FormField>

        <InfoBox message="Your attendance will be marked as WFH once the admin approves this request." />
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
