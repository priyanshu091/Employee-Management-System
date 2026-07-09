'use client'

import { Building2, Home, Calendar } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import SkeletonRow from '@/components/shared/SkeletonRow'
import EmptyState from '@/components/shared/EmptyState'
import { formatTime } from '@/lib/utils/time'
import type { Attendance } from '@/types'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatTableDate(day: Attendance): string {
  const [y, m, d] = day.date.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-IN', { weekday: 'short' })
  return `${weekday}, ${d} ${MONTHS_SHORT[m - 1]}`
}

function formatWorkingHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

interface AttendanceTableProps {
  rows: Attendance[]
  loading?: boolean
  onRowClick?: (day: Attendance) => void
}

export default function AttendanceTable({
  rows,
  loading = false,
  onRowClick,
}: AttendanceTableProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col">
      {/* Table header */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              {['Date', 'Type', 'Check in', 'Check out', 'Hours', 'Status'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Loading skeletons */}
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} cols={6} />
            ))}

            {/* Data rows */}
            {!loading && rows.map((day) => (
              <tr
                key={day.id}
                onClick={() => onRowClick?.(day)}
                className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors duration-150 cursor-pointer"
              >
                <td className="px-4 py-3 text-[13px] font-medium text-[#111827] whitespace-nowrap">
                  {formatTableDate(day)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-md whitespace-nowrap">
                    {day.type === 'office'
                      ? <><Building2 size={11} strokeWidth={1.75} />Office</>
                      : <><Home size={11} strokeWidth={1.75} />WFH</>
                    }
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                  {day.check_in ? formatTime(new Date(day.check_in)) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                  {day.check_out ? formatTime(new Date(day.check_out)) : '—'}
                </td>
                <td className="px-4 py-3 text-[13px] font-medium text-[#111827] whitespace-nowrap">
                  {day.working_hours != null ? formatWorkingHours(Number(day.working_hours)) : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge variant={day.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <EmptyState
          icon={Calendar}
          heading="No records found"
          sub="No attendance records match your selected filters."
        />
      )}

      {/* Row count footer */}
      {!loading && rows.length > 0 && (
        <div className="px-4 py-3 border-t border-[#F3F4F6]">
          <p className="text-[12px] text-[#9CA3AF]">
            Showing {rows.length} record{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
