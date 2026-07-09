'use client'

import { useState } from 'react'
import { Pencil, Building2, Home } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'
import EditAttendanceModal from './EditAttendanceModal'
import { useToast } from '@/components/shared/Toast'
import { updateAttendance } from '@/lib/api/admin'
import type { AttendanceWithProfile } from '@/types'

interface AdminAttendanceTableProps {
  rows: AttendanceWithProfile[]
  onRowUpdate: (updated: AttendanceWithProfile) => void
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatHours(hours: number | null): string {
  if (hours == null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export default function AdminAttendanceTable({ rows, onRowUpdate }: AdminAttendanceTableProps) {
  const { showToast } = useToast()
  const [editRow, setEditRow] = useState<AttendanceWithProfile | null>(null)

  const handleSave = async (id: string, checkIn: string, checkOut: string, reason: string): Promise<boolean> => {
    if (!editRow) return false
    const check_in = checkIn ? `${editRow.date}T${checkIn}:00` : null
    const check_out = checkOut ? `${editRow.date}T${checkOut}:00` : null

    const res = await updateAttendance({ id, check_in, check_out, reason })
    if (res.error) {
      showToast(res.error, 'error')
      return false
    }
    onRowUpdate(res.data)
    showToast('Attendance updated and logged in audit trail.', 'success')
    return true
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl py-16 text-center">
        <p className="text-[14px] font-medium text-[#374151]">No records found</p>
        <p className="text-[13px] text-[#6B7280] mt-1">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {['Employee', 'Date', 'Type', 'Check In', 'Check Out', 'Hours', 'Status', 'Edit'].map((col) => (
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
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors duration-150"
                >
                  {/* Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={row.profile?.full_name ?? '—'} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate max-w-[120px]">{row.profile?.full_name ?? 'Unknown'}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-mono">{row.profile?.employee_id ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap">{formatDate(row.date)}</td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-md whitespace-nowrap">
                      {row.type === 'office'
                        ? <><Building2 size={11} strokeWidth={1.75} />Office</>
                        : <><Home size={11} strokeWidth={1.75} />WFH</>
                      }
                    </span>
                  </td>
                  {/* Check In */}
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                    {formatTime(row.check_in)}
                  </td>
                  {/* Check Out */}
                  <td className="px-4 py-3 text-[13px] text-[#6B7280] whitespace-nowrap">
                    {formatTime(row.check_out)}
                  </td>
                  {/* Hours */}
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111827] whitespace-nowrap">
                    {formatHours(row.working_hours)}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge variant={row.status} />
                  </td>
                  {/* Edit */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditRow(row)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#4F46E5] rounded-md hover:bg-[#EEF2FF] transition-colors duration-150"
                      aria-label={`Edit attendance for ${row.profile?.full_name ?? ''} on ${row.date}`}
                    >
                      <Pencil size={14} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Row count */}
        <div className="px-4 py-3 border-t border-[#F3F4F6]">
          <p className="text-[12px] text-[#9CA3AF]">
            {rows.length} record{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {editRow && (
        <EditAttendanceModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
