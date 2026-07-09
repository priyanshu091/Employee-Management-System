'use client'

import { useState, useCallback } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import { cn } from '@/lib/utils/cn'

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Emergency Leave']

interface FormState {
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

interface FormErrors {
  leaveType?: string
  startDate?: string
  endDate?: string
  reason?: string
}

interface ApplyLeaveModalProps {
  onClose: () => void
  onSubmit: (data: FormState) => void
}

function calcDuration(start: string, end: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  const days = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1
  if (days <= 0) return ''
  return `Duration: ${days} day${days !== 1 ? 's' : ''}`
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  )
}

export default function ApplyLeaveModal({ onClose, onSubmit }: ApplyLeaveModalProps) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FormState>({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.leaveType)  errs.leaveType = 'Select a leave type.'
    if (!form.startDate)  errs.startDate = 'Select a start date.'
    if (!form.endDate)    errs.endDate   = 'Select an end date.'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = 'End date must be after start date.'
    if (!form.reason.trim()) errs.reason = 'Enter a reason.'
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

  const duration = calcDuration(form.startDate, form.endDate)

  return (
    <ModalShell title="Apply for leave" onClose={onClose}>
      <div className="p-5">
        {/* Leave type */}
        <FormField label="Leave type" required error={errors.leaveType}>
          <select
            value={form.leaveType}
            onChange={(e) => set('leaveType', e.target.value)}
            className={cn(INPUT_CLASS, !form.leaveType && 'text-[#9CA3AF]')}
          >
            <option value="" disabled>Select leave type</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start date" required error={errors.startDate}>
            <input
              type="date"
              value={form.startDate}
              min={today}
              onChange={(e) => {
                set('startDate', e.target.value)
                if (form.endDate && e.target.value > form.endDate) {
                  set('endDate', '')
                }
              }}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="End date" required error={errors.endDate}>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || today}
              disabled={!form.startDate}
              onChange={(e) => set('endDate', e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        {/* Duration pill */}
        {duration && (
          <p className="text-[12px] text-[#4F46E5] font-medium -mt-2 mb-4 bg-[#EEF2FF] px-3 py-1 rounded-full inline-block">
            {duration}
          </p>
        )}

        {/* Reason */}
        <FormField label="Reason" required error={errors.reason}>
          <textarea
            value={form.reason}
            onChange={(e) => set('reason', e.target.value)}
            rows={3}
            placeholder="Brief reason for leave..."
            className={cn(INPUT_CLASS, 'resize-none')}
          />
        </FormField>
      </div>

      {/* Footer */}
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
