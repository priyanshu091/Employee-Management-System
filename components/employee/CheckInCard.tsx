'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogIn, LogOut, Clock } from 'lucide-react'
import { getLiveTimer, formatTime } from '@/lib/utils/time'
import { checkOfficeProximity } from '@/lib/utils/geo'
import { getTodayAttendance, getCompanySettings } from '@/lib/api/employee'
import CheckInModal from './CheckInModal'
import StatusBadge from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/Toast'
import type { Attendance } from '@/types'

type CardState = 'loading' | 'idle' | 'working' | 'done'

function formatWorkingHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function CheckInCard() {
  const { showToast } = useToast()
  const [cardState, setCardState] = useState<CardState>('loading')
  const [record, setRecord] = useState<Attendance | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [liveTimer, setLiveTimer] = useState('')
  const [verifying, setVerifying] = useState(false)

  // Load today's attendance on mount
  useEffect(() => {
    getTodayAttendance().then((att) => {
      if (!att) {
        setCardState('idle')
      } else if (att.check_out) {
        setRecord(att)
        setCardState('done')
      } else {
        setRecord(att)
        setCardState('working')
      }
    })
  }, [])

  // Live timer while working
  useEffect(() => {
    if (cardState !== 'working' || !record?.check_in) return
    setLiveTimer(getLiveTimer(record.check_in))
    const interval = setInterval(() => setLiveTimer(getLiveTimer(record.check_in!)), 60_000)
    return () => clearInterval(interval)
  }, [cardState, record])

  const handleCheckInSuccess = useCallback(async (type: 'office' | 'wfh') => {
    // If office, run GPS check first
    if (type === 'office') {
      setVerifying(true)
      const settings = await getCompanySettings()
      setVerifying(false)

      if (settings) {
        const geo = await checkOfficeProximity(
          Number(settings.office_lat),
          Number(settings.office_lng),
          Number(settings.allowed_radius_km)
        )
        if (geo.error) {
          showToast(geo.error, 'error')
          return
        }
        if (!geo.allowed) {
          showToast(`You are ${geo.distanceKm} km from the office. Move closer to check in.`, 'error')
          return
        }
      }
    }

    const res = await fetch('/api/attendance/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const json = await res.json()

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to check in.', 'error')
      return
    }

    setRecord(json.data)
    setCardState('working')
    showToast(type === 'wfh' ? 'WFH request sent. Waiting for admin approval.' : 'Checked in successfully!', 'success')
  }, [showToast])

  const handleCheckOut = useCallback(async () => {
    const res = await fetch('/api/attendance/checkout', { method: 'POST' })
    const json = await res.json()

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to check out.', 'error')
      return
    }

    setRecord(json.data)
    setCardState('done')
    showToast('Checked out successfully!', 'success')
  }, [showToast])

  if (cardState === 'loading') {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4 h-[88px] flex items-center">
        <div className="w-48 h-5 bg-[#F3F4F6] rounded animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-center justify-between mb-4">
        {/* IDLE */}
        {cardState === 'idle' && (
          <>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Today&apos;s attendance</p>
              <p className="text-[18px] font-semibold text-[#111827]">Not checked in yet</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={verifying}
              className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2} />
                  Check in
                </>
              )}
            </button>
          </>
        )}

        {/* WORKING */}
        {cardState === 'working' && record?.check_in && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span className="text-[12px] font-medium text-[#16A34A]">
                  {record.type === 'office' ? 'In office' : 'Working from home'}
                </span>
              </div>
              <p className="text-[18px] font-semibold text-[#111827]">
                Checked in at {formatTime(new Date(record.check_in))}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={13} className="text-[#4F46E5]" />
                <span className="text-[12px] text-[#4F46E5]">{liveTimer}</span>
              </div>
            </div>
            <button
              onClick={handleCheckOut}
              className="flex items-center gap-2 border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] bg-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2"
            >
              <LogOut size={16} strokeWidth={2} />
              Check out
            </button>
          </>
        )}

        {/* DONE */}
        {cardState === 'done' && record?.check_in && record?.check_out && (
          <>
            <div>
              <p className="text-[12px] font-medium text-[#16A34A] mb-1">Day complete</p>
              <p className="text-[18px] font-semibold text-[#111827]">
                {record.working_hours != null ? formatWorkingHours(Number(record.working_hours)) : '—'} total
              </p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                {formatTime(new Date(record.check_in))} – {formatTime(new Date(record.check_out))}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge variant={record.status} />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <CheckInModal
          onClose={() => setShowModal(false)}
          onCheckInSuccess={handleCheckInSuccess}
        />
      )}
    </>
  )
}
