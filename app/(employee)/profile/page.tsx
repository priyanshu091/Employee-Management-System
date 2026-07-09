'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Hash, Calendar, Mail, Shield } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import FormField, { INPUT_CLASS } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { getMyProfile } from '@/lib/api/employee'
import type { Profile } from '@/types'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ReadFieldProps { label: string; value: string }
function ReadField({ label, value }: ReadFieldProps) {
  return (
    <div>
      <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[13px] font-medium text-[#111827]">{value}</p>
    </div>
  )
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
}

export default function ProfilePage() {
  const { showToast } = useToast()
  const { data: profile, mutate } = useSWR('myProfile', getMyProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [emergency, setEmergency] = useState('')
  const [phoneTemp, setPhoneTemp] = useState('')
  const [emergTemp, setEmergTemp] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone ?? '')
      setEmergency(profile.emergency_contact ?? '')
    }
  }, [profile])

  const handleEdit = () => {
    setPhoneTemp(phone)
    setEmergTemp(emergency)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneTemp, emergency_contact: emergTemp }),
    })
    const json = await res.json()
    setSaving(false)

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to update profile.', 'error')
      return
    }

    setPhone(phoneTemp)
    setEmergency(emergTemp)
    setIsEditing(false)
    if (profile) mutate({ ...profile, phone: phoneTemp, emergency_contact: emergTemp }, false)
    showToast('Profile updated successfully.', 'success')
  }

  if (!profile) {
    return (
      <>
        <EmployeeTopbar title="Profile" />
        <main className="flex-1 p-5">
          <div className="bg-white border border-[#E5E7EB] rounded-xl h-40 animate-pulse" />
        </main>
      </>
    )
  }

  return (
    <>
      <EmployeeTopbar title="Profile" />

      <main className="flex-1 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

          {/* LEFT — Profile card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center h-fit">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[24px] font-semibold flex items-center justify-center mx-auto">
              {getInitials(profile.full_name)}
            </div>
            <button className="text-[11px] text-[#4F46E5] mt-2 hover:underline cursor-pointer block mx-auto">
              Change photo
            </button>

            <h2 className="text-[18px] font-semibold text-[#111827] mt-3">{profile.full_name}</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">{profile.designation ?? '—'}</p>
            <span className="inline-block bg-[#F3F4F6] text-[#374151] px-3 py-1 rounded-full text-[12px] mt-2">
              {profile.department ?? '—'}
            </span>

            <hr className="border-[#F3F4F6] my-4" />

            {/* Info list */}
            <div className="text-left space-y-3">
              {[
                { icon: Hash,     label: 'Employee ID', value: profile.employee_id },
                { icon: Calendar, label: 'Joined',      value: fmtDate(profile.joining_date) },
                { icon: Mail,     label: 'Email',       value: profile.email },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={15} className="text-[#9CA3AF] flex-shrink-0" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#6B7280]">{label}</p>
                    <p className="text-[12px] font-medium text-[#111827] truncate">{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <Shield size={15} className="text-[#9CA3AF] flex-shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-[11px] text-[#6B7280]">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    profile.status === 'active' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {profile.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {/* Personal information */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-[#111827]">Personal information</h3>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="text-[12px] text-[#4F46E5] hover:underline font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Phone number">
                      <input
                        type="tel"
                        value={phoneTemp}
                        onChange={(e) => setPhoneTemp(e.target.value)}
                        className={INPUT_CLASS}
                        autoFocus
                      />
                    </FormField>
                    <FormField label="Emergency contact">
                      <input
                        type="tel"
                        value={emergTemp}
                        onChange={(e) => setEmergTemp(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </FormField>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg px-4 py-2 text-[13px] transition-colors duration-150 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-4 py-2 text-[13px] font-medium transition-colors duration-150 disabled:opacity-70 min-w-[100px]"
                    >
                      {saving ? <Spinner /> : 'Save changes'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  <ReadField label="Phone number"     value={phone || '—'}     />
                  <ReadField label="Emergency contact" value={emergency || '—'} />
                </div>
              )}
            </div>

            {/* Company information — read only */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-[14px] font-semibold text-[#111827]">Company information</h3>
                <span className="text-[11px] text-[#9CA3AF]">(Only admin can edit)</span>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <ReadField label="Department"         value={profile.department ?? '—'}  />
                <ReadField label="Designation"        value={profile.designation ?? '—'} />
                <ReadField label="Joining date"       value={fmtDate(profile.joining_date)}     />
                <ReadField label="Employment status"  value={profile.status === 'active' ? 'Active' : 'Inactive'}      />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
