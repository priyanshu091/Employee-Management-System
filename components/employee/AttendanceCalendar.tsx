'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Attendance } from '@/types'

const DOT_COLORS: Record<string, string> = {
  present:  'bg-[#16A34A]',
  late:     'bg-[#D97706]',
  absent:   'bg-[#DC2626]',
  wfh:      'bg-[#2563EB]',
  leave:    'bg-[#7C3AED]',
  holiday:  'bg-[#9CA3AF]',
}

const LEGEND = [
  { label: 'Present', color: 'bg-[#16A34A]' },
  { label: 'Late',    color: 'bg-[#D97706]' },
  { label: 'WFH',    color: 'bg-[#2563EB]' },
  { label: 'Leave',  color: 'bg-[#7C3AED]' },
  { label: 'Absent', color: 'bg-[#DC2626]' },
]

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun — convert to Mon-based (0=Mon ... 6=Sun)
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function toDateKey(year: number, month: number, date: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
}

interface AttendanceCalendarProps {
  size?: 'compact' | 'full'
  attendanceData?: Attendance[]
  onDayClick?: (day: Attendance) => void
}

export default function AttendanceCalendar({ size = 'compact', attendanceData = [], onDayClick }: AttendanceCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const attendanceByDate = new Map(attendanceData.map((a) => [a.date, a]))

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Build grid cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const isWeekend = (cellIndex: number) => {
    const dayOfWeek = cellIndex % 7 // 0=Mon ... 5=Sat, 6=Sun
    return dayOfWeek === 5 || dayOfWeek === 6
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-6 h-6 border border-[#E5E7EB] rounded-md flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors duration-150"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-medium text-[#111827]">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="w-6 h-6 border border-[#E5E7EB] rounded-md flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors duration-150"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-[#6B7280] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const day = attendanceByDate.get(toDateKey(viewYear, viewMonth, date))
          const isToday = isCurrentMonth && date === today.getDate()
          const weekend = isWeekend(i)
          const hasData = !!day
          const clickable = hasData

          return (
            <button
              key={i}
              onClick={() => clickable && day && onDayClick?.(day)}
              disabled={!clickable}
              className={cn(
                'relative flex flex-col items-center justify-center aspect-square rounded-md transition-colors duration-150',
                size === 'full' ? 'text-[12px] min-h-[36px]' : 'text-[11px]',
                isToday
                  ? 'bg-[#4F46E5] text-white font-medium'
                  : weekend
                  ? 'text-[#D1D5DB]'
                  : 'text-[#6B7280]',
                clickable && 'hover:bg-[#F3F4F6] cursor-pointer',
                !clickable && 'cursor-default'
              )}
              aria-label={`${date} ${day?.status ?? ''}`}
            >
              {date}
              {day && (
                <span
                  className={cn(
                    'absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    DOT_COLORS[day.status]
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#F3F4F6]">
        {LEGEND.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', color)} />
            <span className="text-[10px] text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
