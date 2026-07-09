'use client'

import { useEffect } from 'react'
import { X, Building2, Home } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatTime } from '@/lib/utils/time'
import type { Attendance } from '@/types'

interface DayDetailModalProps {
  day: Attendance
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-[13px] text-[#6B7280]">{label}</span>
      <span className="text-[13px] font-medium text-[#111827]">{value}</span>
    </div>
  )
}

function formatWorkingHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function DayDetailModal({ day, onClose }: DayDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // day.date is "YYYY-MM-DD" — parse as local date, not UTC, to avoid off-by-one day shifts
  const [y, m, d] = day.date.split('-').map(Number)
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const TypeChip = () => (
    <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-md">
      {day.type === 'office' ? (
        <><Building2 size={11} /> Office</>
      ) : (
        <><Home size={11} /> Work from home</>
      )}
    </span>
  )

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
    >
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 w-full max-w-xs">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="day-detail-title" className="text-[14px] font-semibold text-[#111827] leading-tight">
              {dateLabel}
            </h2>
            <div className="mt-1.5">
              <StatusBadge variant={day.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors ml-2 mt-0.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F3F4F6] mb-1" />

        {/* Detail rows */}
        <DetailRow label="Check in"      value={day.check_in  ? formatTime(new Date(day.check_in))  : '—'} />
        <DetailRow label="Check out"     value={day.check_out ? formatTime(new Date(day.check_out)) : '—'} />
        <DetailRow label="Working hours" value={day.working_hours != null ? formatWorkingHours(Number(day.working_hours)) : '—'} />
        <DetailRow label="Type"          value={<TypeChip />} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-4 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg py-2 text-[13px] transition-colors duration-150"
        >
          Close
        </button>
      </div>
    </div>
  )
}
