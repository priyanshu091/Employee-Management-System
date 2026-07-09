'use client'

import { useState, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { Download } from 'lucide-react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import SearchFilterBar from '@/components/admin/SearchFilterBar'
import AdminAttendanceTable from '@/components/admin/AdminAttendanceTable'
import { useToast } from '@/components/shared/Toast'
import { getAdminAttendance } from '@/lib/api/admin'
import { exportReportToExcel } from '@/lib/export/excel'
import type { AttendanceStatus } from '@/types'
import type { AttendanceWithProfile } from '@/types'

// ── Dynamic month options — no hardcoded dates ────────────────────────────────
function generateMonthOptions() {
  const options: { value: string; label: string }[] = [
    { value: 'all', label: 'All dates' },
  ]
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
    })
  }
  return options
}

const MONTH_OPTIONS = generateMonthOptions()

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'wfh', label: 'WFH' },
  { value: 'leave', label: 'Leave' },
]

const SUMMARY_STATS: { label: string; status: AttendanceStatus; color: string }[] = [
  { label: 'Present', status: 'present', color: '#16A34A' },
  { label: 'Late',    status: 'late',    color: '#D97706' },
  { label: 'Absent',  status: 'absent',  color: '#DC2626' },
  { label: 'WFH',    status: 'wfh',     color: '#2563EB' },
  { label: 'Leave',  status: 'leave',   color: '#7C3AED' },
]

export default function AdminAttendancePage() {
  const { showToast } = useToast()
  
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('all')
  const [status, setStatus] = useState('all')

  const { data, isLoading: loading, mutate } = useSWR(
    ['adminAttendance', month, status],
    ([_, m, s]) => getAdminAttendance({ month: m as string, status: s as string })
  )
  
  const rows = data || []

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || r.profile?.full_name?.toLowerCase().includes(q)
        || r.profile?.employee_id?.toLowerCase().includes(q)
      return matchSearch
    })
  }, [rows, search])

  const handleRowUpdate = useCallback((updated: AttendanceWithProfile) => {
    mutate(
      (prev = []) => prev.map((r) => r.id === updated.id ? { ...r, ...updated, profile: r.profile } : r),
      false
    )
  }, [mutate])

  const countByStatus = (s: AttendanceStatus) => filtered.filter((r) => r.status === s).length

  return (
    <>
      <AdminTopbar title="Attendance Records" />

      <main className="flex-1 p-5">
        {/* Filter bar */}
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by employee name or ID..."
          selects={[
            { value: month, onChange: setMonth, options: MONTH_OPTIONS, ariaLabel: 'Month' },
            { value: status, onChange: setStatus, options: STATUS_OPTIONS, ariaLabel: 'Status' },
          ]}
          rightSlot={
            <button
              onClick={() => {
                try {
                  exportReportToExcel('attendance', filtered, `Attendance_Export_${new Date().toISOString().split('T')[0]}`)
                  showToast('Excel exported successfully.', 'success')
                } catch {
                  showToast('Failed to export Excel.', 'error')
                }
              }}
              className="flex items-center gap-2 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] px-4 py-2 rounded-lg text-[13px] transition-colors duration-150 flex-shrink-0"
            >
              <Download size={14} strokeWidth={1.75} />
              Export
            </button>
          }
          className="mb-4"
        />

        {/* Summary strip */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-3 flex flex-wrap gap-6 mb-4">
          {SUMMARY_STATS.map(({ label, status: s, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[12px] text-[#6B7280]">{label}:</span>
              <span className="text-[12px] font-medium text-[#111827]">{countByStatus(s)}</span>
            </div>
          ))}
          <span className="ml-auto text-[12px] text-[#9CA3AF]">{filtered.length} records</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-[#F3F4F6] last:border-0 bg-[#F3F4F6] animate-pulse" />
            ))}
          </div>
        ) : (
          <AdminAttendanceTable
            rows={filtered}
            onRowUpdate={handleRowUpdate}
          />
        )}
      </main>
    </>
  )
}
