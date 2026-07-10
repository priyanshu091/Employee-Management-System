'use client'

import { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import AdminTopbar from '@/components/admin/AdminTopbar'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { updateSettings } from '@/lib/api/admin'
import { useCompanySettings } from '@/lib/hooks/useCompanySettings'
import { cn } from '@/lib/utils/cn'
import type { CompanySettings } from '@/types'

interface SettingsForm {
  companyName: string
  officeAddress: string
  officeLat: string
  officeLng: string
  allowedRadiusKm: number
  officeStartTime: string
  officeEndTime: string
  gracePeriodMinutes: number
  attendanceLockTime: string
  logoUrl: string | null
}

function toForm(s: CompanySettings): SettingsForm {
  return {
    companyName: s.company_name,
    officeAddress: s.office_address,
    officeLat: String(s.office_lat),
    officeLng: String(s.office_lng),
    allowedRadiusKm: s.allowed_radius_km,
    officeStartTime: s.office_start_time.slice(0, 5),
    officeEndTime: s.office_end_time.slice(0, 5),
    gracePeriodMinutes: s.grace_period_minutes,
    attendanceLockTime: s.attendance_lock_time.slice(0, 5),
    logoUrl: s.logo_url || null,
  }
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
      <h2 className="text-[14px] font-semibold text-[#111827] mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function AdminSettingsPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState<SettingsForm | null>(null)
  const [saved, setSaved] = useState<SettingsForm | null>(null)
  const { settings: data, loading, mutate } = useCompanySettings()
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)

  // Initialize form state when data loads
  useEffect(() => {
    if (data && !form && !saved) {
      const f = toForm(data)
      setForm(f)
      setSaved(f)
    }
  }, [data, form, saved])

  const isDirty = (form && saved && JSON.stringify(form) !== JSON.stringify(saved))

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((f) => f ? { ...f, [key]: value } : f)
  }

  const handleSave = useCallback(async () => {
    if (!form) return
    setSaving(true)
    let newLogoUrl = form.logoUrl

    const res = await updateSettings({
      company_name: form.companyName,
      office_address: form.officeAddress,
      office_lat: Number(form.officeLat),
      office_lng: Number(form.officeLng),
      allowed_radius_km: form.allowedRadiusKm,
      office_start_time: form.officeStartTime,
      office_end_time: form.officeEndTime,
      grace_period_minutes: form.gracePeriodMinutes,
      attendance_lock_time: form.attendanceLockTime,
      logo_url: newLogoUrl,
    })
    setSaving(false)
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    
    const updatedForm = { ...form, logoUrl: newLogoUrl }
    setSaved(updatedForm)
    setForm(updatedForm)

    if (data) mutate({ ...data, ...updatedForm, logo_url: newLogoUrl, office_lat: Number(updatedForm.officeLat), office_lng: Number(updatedForm.officeLng) }, false)
    showToast('Settings saved successfully.', 'success')
  }, [form, showToast, data, mutate])

  const handleDiscard = () => {
    if (saved) setForm(saved)
  }

  function Spinner() {
    return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  }

  if (loading || !form) {
    return (
      <>
        <AdminTopbar title="Company Settings" />
        <main className="flex-1 p-5 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#F3F4F6] animate-pulse rounded-xl" />
          ))}
        </main>
      </>
    )
  }

  return (
    <>
      <AdminTopbar title="Company Settings" />

      <main className="flex-1 p-5 pb-24 flex flex-col gap-4">

        {/* Card 1 — Company Information */}
        <SectionCard title="Company information">
          <FormField label="Company name">
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Office address">
            <textarea
              value={form.officeAddress}
              onChange={(e) => set('officeAddress', e.target.value)}
              rows={2}
              className={cn(INPUT_CLASS, 'resize-none')}
            />
          </FormField>
          {/* Logo upload */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Company logo
            </label>
            <div className="relative w-full h-24 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-[#4F46E5] hover:bg-[#FAFAFE] transition-colors duration-150">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const objectUrl = URL.createObjectURL(file)
                    // Optimistically update
                    setForm(f => f ? { ...f, logoUrl: objectUrl } : f)
                    if (data) mutate({ ...data, logo_url: objectUrl }, false)
                    
                    setLogoUploading(true)
                    const formData = new FormData()
                    formData.append('file', file)
                    const res = await fetch('/api/settings/logo', {
                      method: 'POST',
                      body: formData,
                    })
                    const json = await res.json()
                    setLogoUploading(false)
                    
                    if (json.error) {
                      showToast(json.error, 'error')
                      // Revert optimism
                      if (data) mutate(data, false)
                    } else {
                      const newLogoUrl = json.data.publicUrl
                      setForm(f => f ? { ...f, logoUrl: newLogoUrl } : f)
                      setSaved(s => s ? { ...s, logoUrl: newLogoUrl } : s)
                      if (data) mutate({ ...data, logo_url: newLogoUrl }, false)
                    }
                  }
                }}
              />
              {form.logoUrl ? (
                <>
                  <img
                    src={form.logoUrl}
                    alt="Company Logo"
                    className={cn(
                      "w-full h-full object-contain p-2 transition-opacity duration-200",
                      logoUploading ? "opacity-50" : "opacity-100"
                    )}
                  />
                  {logoUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <p className="text-[13px] text-[#9CA3AF]">Click to upload logo</p>
                  <p className="text-[11px] text-[#C4C9D4]">PNG, JPG up to 2MB</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Card 2 — Office Location */}
        <SectionCard title="Office location">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="Office latitude">
              <input
                type="text"
                value={form.officeLat}
                onChange={(e) => set('officeLat', e.target.value)}
                placeholder="e.g. 26.8467"
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Office longitude">
              <input
                type="text"
                value={form.officeLng}
                onChange={(e) => set('officeLng', e.target.value)}
                placeholder="e.g. 80.9462"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 mb-4">
            <p className="text-[12px] text-[#6B7280] leading-relaxed">
              These coordinates are used to verify employee location during office check-in. Use Google Maps to find your office coordinates.
            </p>
          </div>
          {/* Radius slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-medium text-[#374151]">Allowed radius</label>
              <span className="text-[13px] font-semibold text-[#4F46E5]">{form.allowedRadiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={form.allowedRadiusKm}
              onChange={(e) => set('allowedRadiusKm', Number(e.target.value))}
              className="w-full accent-[#4F46E5] cursor-pointer"
              aria-label="Allowed radius in km"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[#9CA3AF]">0.5 km</span>
              <span className="text-[10px] text-[#9CA3AF]">5 km</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-2">
              Employees must be within this distance from office coordinates to check in from office.
            </p>
          </div>
        </SectionCard>

        {/* Card 3 — Working Hours */}
        <SectionCard title="Working hours">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Office start time">
              <input
                type="time"
                value={form.officeStartTime}
                onChange={(e) => set('officeStartTime', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Office end time">
              <input
                type="time"
                value={form.officeEndTime}
                onChange={(e) => set('officeEndTime', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Grace period">
              <div className="relative">
                <input
                  type="number"
                  value={form.gracePeriodMinutes}
                  onChange={(e) => set('gracePeriodMinutes', Number(e.target.value))}
                  min={0}
                  max={60}
                  className={cn(INPUT_CLASS, 'pr-16')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF] pointer-events-none">
                  minutes
                </span>
              </div>
            </FormField>
          </div>
        </SectionCard>

        {/* Card 4 — Attendance Lock */}
        <SectionCard title="Attendance lock">
          <div className="grid grid-cols-2 gap-4 items-start">
            <FormField label="Lock time">
              <input
                type="time"
                value={form.attendanceLockTime}
                onChange={(e) => set('attendanceLockTime', e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>
            <div className="pt-6">
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                Attendance records are automatically locked after this time. Modifications after the lock require a correction request.
              </p>
            </div>
          </div>
        </SectionCard>

      </main>

      {/* Sticky save bar — only when dirty */}
      {isDirty && (
        <div className="fixed bottom-0 left-[200px] right-0 bg-white border-t border-[#E5E7EB] px-6 py-3 flex items-center justify-end gap-3 z-20">
          <span className="text-[12px] text-[#9CA3AF] mr-auto">You have unsaved changes</span>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg px-4 py-2 text-[13px] transition-colors duration-150 disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-5 py-2 text-[13px] font-medium transition-colors duration-150 disabled:opacity-70 min-w-[120px]"
          >
            {saving ? <Spinner /> : 'Save changes'}
          </button>
        </div>
      )}
    </>
  )
}
