import { Umbrella, Home } from 'lucide-react'
import Link from 'next/link'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import CheckInCard from '@/components/employee/CheckInCard'
import AttendanceCalendar from '@/components/employee/AttendanceCalendar'
import RequestCard from '@/components/employee/RequestCard'
import { getGreeting } from '@/lib/utils/time'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Current Month Dates
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

  // Fetch all required data in parallel
  const [
    { data: profile },
    { data: monthAttendance },
    { data: leaveReqs },
    { data: wfhReqs },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('attendance').select('*').eq('employee_id', user.id).gte('date', startOfMonth).lte('date', endOfMonth).order('date', { ascending: false }),
    supabase.from('leave_requests').select('*').eq('employee_id', user.id).order('created_at', { ascending: false }),
    supabase.from('wfh_requests').select('*').eq('employee_id', user.id).order('created_at', { ascending: false })
  ])

  // Calculate monthly stats based on fetched attendance
  const rows = monthAttendance ?? []
  const stats = {
    present: rows.filter((r) => r.status === 'present').length,
    late:    rows.filter((r) => r.status === 'late').length,
    leave:   rows.filter((r) => r.status === 'leave').length,
    wfh:     rows.filter((r) => r.status === 'wfh').length,
  }

  const greeting = getGreeting()
  const name = profile?.full_name?.split(' ')[0] ?? '...'

  const STAT_CARDS = [
    { value: stats.present, label: 'Days present',  badgeBg: '#F0FDF4', badgeColor: '#16A34A', badgeText: 'This month' },
    { value: stats.late,    label: 'Days late',     badgeBg: '#FFFBEB', badgeColor: '#D97706', badgeText: 'This month' },
    { value: stats.leave,   label: 'Leaves taken',  badgeBg: '#F0FDF4', badgeColor: '#16A34A', badgeText: 'This month' },
    { value: stats.wfh,     label: 'WFH days',      badgeBg: '#EFF6FF', badgeColor: '#2563EB', badgeText: 'This month' },
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
        <CheckInCard />

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
          <AttendanceCalendar attendanceData={monthAttendance || []} />
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-medium text-[#111827]">My requests</h2>
              <Link href="/leave" className="text-[12px] text-[#4F46E5] hover:underline">See all →</Link>
            </div>
            {recentRequests.length === 0 ? (
              <p className="text-[13px] text-[#6B7280] text-center py-8">No requests yet.</p>
            ) : (
              recentRequests.map((req, i) => <RequestCard key={i} {...req} />)
            )}
          </div>
        </div>
      </main>
    </>
  )
}
