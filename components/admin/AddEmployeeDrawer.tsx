'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Lock } from 'lucide-react'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import { cn } from '@/lib/utils/cn'
import { DEPARTMENTS } from '@/lib/mock/employees'

interface DrawerFormState {
  fullName: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string
}

interface DrawerFormErrors {
  fullName?: string
  email?: string
  department?: string
  designation?: string
  joiningDate?: string
}

import type { Profile } from '@/types'

interface AddEmployeeDrawerProps {
  open: boolean
  nextEmployeeId: string    // e.g. "EMP-013"
  editTarget?: Profile | null
  onClose: () => void
  onSubmit: (data: DrawerFormState, isEdit: boolean, editId?: string) => Promise<boolean>
}

const EMPTY_FORM: DrawerFormState = {
  fullName: '', email: '', phone: '',
  department: '', designation: '', joiningDate: '',
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function AddEmployeeDrawer({
  open,
  nextEmployeeId,
  editTarget,
  onClose,
  onSubmit,
}: AddEmployeeDrawerProps) {
  const [form, setForm]     = useState<DrawerFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<DrawerFormErrors>({})
  const [loading, setLoading] = useState(false)

  // Reset/Prefill form when drawer opens
  useEffect(() => {
    if (open) {
      if (editTarget) {
        setForm({
          fullName: editTarget.full_name || '',
          email: editTarget.email || '',
          phone: editTarget.phone || '',
          department: editTarget.department || '',
          designation: editTarget.designation || '',
          joiningDate: editTarget.joining_date || '',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
      setLoading(false)
    }
  }, [open, editTarget])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const set = (field: keyof DrawerFormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errs: DrawerFormErrors = {}
    if (!form.fullName.trim())    errs.fullName    = 'Enter full name.'
    if (!form.email.trim())       errs.email       = 'Enter company email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  errs.email       = 'Enter a valid email.'
    if (!form.department)         errs.department  = 'Select a department.'
    if (!form.designation.trim()) errs.designation = 'Enter designation.'
    if (!form.joiningDate)        errs.joiningDate = 'Select joining date.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setLoading(true)
    const ok = await onSubmit(form, !!editTarget, editTarget?.id)
    setLoading(false)
    if (ok) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, onClose, onSubmit])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[420px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Add employee"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#111827]">{editTarget ? 'Edit employee' : 'Add employee'}</h2>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-1 rounded"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <FormField label="Full name" required error={errors.fullName}>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="e.g. Rahul Kumar"
              className={INPUT_CLASS}
              autoFocus
            />
          </FormField>

          <FormField label="Company email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="rahul@company.com"
              className={INPUT_CLASS}
              disabled={!!editTarget}
            />
          </FormField>

          <FormField label="Phone number">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={INPUT_CLASS}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department" required error={errors.department}>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className={cn(INPUT_CLASS, !form.department && 'text-[#9CA3AF]')}
              >
                <option value="" disabled>Select dept.</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Designation" required error={errors.designation}>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => set('designation', e.target.value)}
                placeholder="e.g. Developer"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          <FormField label="Joining date" required error={errors.joiningDate}>
            <input
              type="date"
              value={form.joiningDate}
              onChange={(e) => set('joiningDate', e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>

          {/* Auto-generated Employee ID */}
          <div className="mb-2">
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Employee ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={editTarget ? editTarget.employee_id : nextEmployeeId}
                disabled
                className="w-full border border-[#E5E7EB] rounded-md px-3 pr-9 py-2.5 text-[13px] text-[#9CA3AF] bg-[#F9FAFB] cursor-not-allowed font-mono"
              />
              <Lock
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                aria-hidden="true"
              />
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">Auto-generated — cannot be changed</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#E5E7EB] bg-white flex-shrink-0">
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
            {loading ? <Spinner /> : editTarget ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </>
  )
}
