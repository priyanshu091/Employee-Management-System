'use client'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEARS = [2025, 2026]

const STATUS_OPTIONS = [
  { value: 'all',     label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late',    label: 'Late' },
  { value: 'absent',  label: 'Absent' },
  { value: 'leave',   label: 'Leave' },
  { value: 'wfh',     label: 'WFH' },
]

const SELECT_CLASS = `
  border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[13px] text-[#111827] bg-white
  focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none
  transition-colors duration-150 cursor-pointer
`

interface AttendanceFilterBarProps {
  selectedMonth: number   // 0-indexed
  selectedYear: number
  selectedStatus: string
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onStatusChange: (status: string) => void
}

export default function AttendanceFilterBar({
  selectedMonth,
  selectedYear,
  selectedStatus,
  onMonthChange,
  onYearChange,
  onStatusChange,
}: AttendanceFilterBarProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-3 flex items-center gap-3 mb-4 flex-wrap">
      <h1 className="text-[15px] font-semibold text-[#111827] flex-1">
        Attendance History
      </h1>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className={SELECT_CLASS}
          aria-label="Select month"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className={SELECT_CLASS}
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
