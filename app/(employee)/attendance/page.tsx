'use client'

import { useState, useEffect, useMemo } from 'react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import AttendanceFilterBar from '@/components/employee/AttendanceFilterBar'
import PageLoader from '@/components/shared/PageLoader'
import AttendanceCalendar from '@/components/employee/AttendanceCalendar'
import AttendanceTable from '@/components/employee/AttendanceTable'
import DayDetailModal from '@/components/employee/DayDetailModal'
import { getAttendanceHistory } from '@/lib/api/employee'
import type { Attendance } from '@/types'

export default function AttendancePage() {
  const today = new Date()

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDay, setSelectedDay] = useState<Attendance | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAttendanceHistory(selectedYear, selectedMonth).then((data) => {
      setAttendance(data)
      setLoading(false)
    })
  }, [selectedMonth, selectedYear])

  // Filter rows based on selected status (month/year already filtered by the query)
  const filteredRows = useMemo(() => {
    return attendance
      .filter((d) => selectedStatus === 'all' || d.status === selectedStatus)
      .sort((a, b) => b.date.localeCompare(a.date)) // newest first
  }, [attendance, selectedStatus])

  const handleDayClick = (day: Attendance) => {
    setSelectedDay(day)
  }

  return (
    <>
      <EmployeeTopbar title="Attendance" />

      <main className="flex-1 p-5">
        {/* Filter bar */}
        <AttendanceFilterBar
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedStatus={selectedStatus}
          onMonthChange={(m) => { setSelectedMonth(m) }}
          onYearChange={(y) => { setSelectedYear(y) }}
          onStatusChange={setSelectedStatus}
        />

        {loading ? (
          <div className="mt-8">
            <PageLoader />
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-wrap gap-5 mb-4">
          {[
            { label: 'Present', color: '#16A34A', status: 'present' },
            { label: 'Late',    color: '#D97706', status: 'late'    },
            { label: 'Absent',  color: '#DC2626', status: 'absent'  },
            { label: 'WFH',     color: '#2563EB', status: 'wfh'     },
            { label: 'Leave',   color: '#7C3AED', status: 'leave'   },
          ].map(({ label, color, status }) => {
            const count = attendance.filter((d) => d.status === status).length
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[12px] text-[#6B7280]">{label}:</span>
                <span className="text-[12px] font-medium text-[#111827]">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          {/* Left: Calendar */}
          <AttendanceCalendar
            size="full"
            attendanceData={attendance}
            onDayClick={handleDayClick}
          />

          {/* Right: Table */}
          <AttendanceTable
            rows={filteredRows}
            loading={loading}
            onRowClick={handleDayClick}
          />
        </div>
        </>
        )}
      </main>

      {/* Day detail modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  )
}
