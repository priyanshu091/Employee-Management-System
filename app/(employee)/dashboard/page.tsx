'use client'

import { useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Umbrella, Home } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import CheckInCard from '@/components/employee/CheckInCard'
import AttendanceCalendar from '@/components/employee/AttendanceCalendar'
import RequestCard from '@/components/employee/RequestCard'
import PageLoader from '@/components/shared/PageLoader'
import { getGreeting } from '@/lib/utils/time'
import {
  getMyProfile,
  getMonthlyStats,
  getMyLeaveRequests,
  getMyWFHRequests,
  getAttendanceHistory,
} from '@/lib/api/employee'

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const { data: profile, isLoading: loadingProfile } = useSWR('myProfile', getMyProfile)
  const { data: stats, isLoading: loadingStats, mutate: mutateStats } = useSWR('monthlyStats', getMonthlyStats)
  const { data: leaveReqs, isLoading: loadingLeave } = useSWR('myLeaveRequests', getMyLeaveRequests)
  const { data: wfhReqs, isLoading: loadingWfh } = useSWR('myWFHRequests', getMyWFHRequests)
  const { data: attendance, isLoading: loadingAttendance } = useSWR(
    ['attendanceHistory', currentYear, currentMonth],
    ([_, y, m]) => getAttendanceHistory(y as number, m as number)
  )

  const loading = loadingProfile || loadingStats || loadingLeave || loadingWfh || loadingAttendance

  const fetchStats = useCallback(async () => {
    await mutateStats()
  }, [mutateStats])

  const greeting = getGreeting()
  const name = profile?.full_name?.split(' ')[0] ?? '...'

  const STAT_CARDS = [
    { value: stats?.present || 0, label: 'Days present',  badgeBg: '#F0FDF4', badgeColor: '#16A34A', badgeText: 'This month' },
    { value: stats?.late || 0,    label: 'Days late',     badgeBg: '#FFFBEB', badgeColor: '#D97706', badgeText: 'This month' },
    { value: stats?.leave || 0,   label: 'Leaves taken',  badgeBg: '#F0FDF4', badgeColor: '#16A34A', badgeText: 'This month' },
    { value: stats?.wfh || 0,     label: 'WFH days',      badgeBg: '#EFF6FF', badgeColor: '#2563EB', badgeText: 'This month' },
  ]

  // Build recent requests from leave + wfh combined, most recent first
  const recentRequests = [
    ...(leaveReqs || []).map((r) => ({
      icon: Umbrella, iconBg: '#FFFBEB', iconColor: '#D97706',
      type: r.leave_type, dateRange: r.start_date, reason: r.reason,
      submittedOn: r.created_at, status: r.status,
    })),
    ...(wfhReqs || []).map((r) => ({
      icon: Home, iconBg: '#EFF6FF', iconColor: '#2563EB',
      type: 'Work from home', dateRange: r.date, reason: r.reason,
      submittedOn: r.created_at, status: r.status,
    })),
  ]
    .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
    .slice(0, 4)

  return (
    <>
      <EmployeeTopbar title={`${greeting}, ${name}`} />

      <main className="flex-1 p-5">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <CheckInCard onCheckInSuccess={fetchStats} onCheckOutSuccess={fetchStats} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
              <p className="text-[22px] font-semibold text-[#111827]">{s.value}</p>
              <p className="text-[11px] text-[#6B7280] mt-1">{s.label}</p>
              <span
                className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: s.badgeBg, color: s.badgeColor }}
              >
                {s.badgeText}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AttendanceCalendar attendanceData={attendance || []} />
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-[#111827]">My requests</h2>
              <a href="/leave" className="text-[12px] text-[#4F46E5] hover:underline">See all →</a>
            </div>
            {recentRequests.length === 0 ? (
              <p className="text-[13px] text-[#6B7280] text-center py-8">No requests yet.</p>
            ) : (
              recentRequests.map((req, i) => <RequestCard key={i} {...req} />)
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </>
  )
}
