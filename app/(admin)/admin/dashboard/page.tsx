import { UserPlus, BarChart2, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import AdminTopbar from '@/components/admin/AdminTopbar'
import StatCard from '@/components/admin/StatCard'
import PendingRequestsPanel from '@/components/admin/PendingRequestsPanel'
import WhoIsInOffice from '@/components/admin/WhoIsInOffice'
import QuickActionCard from '@/components/admin/QuickActionCard'
import { createClient } from '@/lib/supabase/server'
import { getTodayIST } from '@/lib/utils/time'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const today = getTodayIST()

  const [
    { data: profile },
    { count: totalEmployees },
    { data: todayAttendance },
    { data: inOffice }
  ] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('role', 'employee'),
    supabase.from('attendance').select('status, employee_id').eq('date', today),
    supabase.from('attendance')
      .select('employee_id, check_in, profiles(full_name, department)')
      .eq('date', today)
      .eq('type', 'office')
      .not('check_in', 'is', null)
      .is('check_out', null)
  ])

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard') // unauthorized
  }

  const rows = todayAttendance ?? []
  const stats = {
    totalEmployees: totalEmployees ?? 0,
    present: rows.filter((r) => r.status === 'present' || r.status === 'late').length,
    absent: Math.max((totalEmployees ?? 0) - rows.length, 0),
    late: rows.filter((r) => r.status === 'late').length,
    wfh: rows.filter((r) => r.status === 'wfh').length,
    onLeave: rows.filter((r) => r.status === 'leave').length,
  }

  const inOfficeData = inOffice ?? []

  const statCards = [
    { label: 'Total employees', value: stats.totalEmployees, dotColor: '#9CA3AF' },
    { label: 'Present today', value: stats.present, dotColor: '#16A34A' },
    { label: 'Absent today', value: stats.absent, dotColor: '#DC2626' },
    { label: 'Late today', value: stats.late, dotColor: '#D97706' },
    { label: 'On WFH', value: stats.wfh, dotColor: '#2563EB' },
    { label: 'On leave', value: stats.onLeave, dotColor: '#7C3AED' },
  ]

  return (
    <>
      <AdminTopbar
        title="Dashboard"
        action={
          <Link
            href="/admin/employees"
            className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
          >
            <UserPlus size={15} strokeWidth={2} />
            Add employee
          </Link>
        }
      />

      <main className="flex-1 p-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              dotColor={stat.dotColor}
            />
          ))}
        </div>

        {/* Main grid: pending requests + who's in office */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-4 mb-4">
          <PendingRequestsPanel />
          {/* @ts-ignore */}
          <WhoIsInOffice rows={inOfficeData} loading={false} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionCard
            icon={UserPlus}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            label="Add employee"
            sublabel="Onboard a new team member"
            href="/admin/employees"
          />
          <QuickActionCard
            icon={BarChart2}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            label="Generate report"
            sublabel="Daily, monthly, or custom"
            href="/admin/reports"
          />
          <QuickActionCard
            icon={CalendarPlus}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            label="Add holiday"
            sublabel="Update company calendar"
            href="/admin/holidays"
          />
        </div>
      </main>
    </>
  )
}
