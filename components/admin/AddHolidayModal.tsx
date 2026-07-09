'use client'

import { useState, useCallback } from 'react'
import ModalShell from '@/components/shared/ModalShell'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'

interface FormState { name: string; date: string }
interface FormErrors { name?: string; date?: string }

interface AddHolidayModalProps {
  onClose: () => void
  onSubmit: (data: FormState) => void
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function AddHolidayModal({ onClose, onSubmit }: AddHolidayModalProps) {
  const [form, setForm]     = useState<FormState>({ name: '', date: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Enter a holiday name.'
    if (!form.date)        errs.date = 'Select a date.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    onSubmit(form)
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, onClose, onSubmit])

  return (
    <ModalShell title="Add holiday" onClose={onClose} maxWidth="max-w-sm">
      <div className="p-5">
        <FormField label="Holiday name" required error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Diwali"
            className={INPUT_CLASS}
            autoFocus
          />
        </FormField>
        <FormField label="Date" required error={errors.date}>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>
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
          {loading ? <Spinner /> : 'Add holiday'}
        </button>
      </div>
    </ModalShell>
  )
}
