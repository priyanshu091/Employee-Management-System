'use client'

import { useState, useEffect } from 'react'
import { UserPlus, BarChart2, CalendarPlus } from 'lucide-react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import StatCard from '@/components/admin/StatCard'
import PendingRequestsPanel from '@/components/admin/PendingRequestsPanel'
import WhoIsInOffice from '@/components/admin/WhoIsInOffice'
import QuickActionCard from '@/components/admin/QuickActionCard'
import { getDashboardStats } from '@/lib/api/admin'

interface InOfficeRow {
  employee_id: string
  check_in: string
  profiles: { full_name: string; department: string | null } | null
}

const EMPTY_STATS = { totalEmployees: 0, present: 0, absent: 0, late: 0, wfh: 0, onLeave: 0 }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(EMPTY_STATS)
  const [inOffice, setInOffice] = useState<InOfficeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then((data) => {
      if (data) {
        setStats(data.stats)
        setInOffice(data.inOffice)
      }
      setLoading(false)
    })
  }, [])

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
          <a
            href="/admin/employees"
            className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
          >
            <UserPlus size={15} strokeWidth={2} />
            Add employee
          </a>
        }
      />

      <main className="flex-1 p-5">
        {/* Stats row */}
        <div className="grid grid-cols-6 gap-3 mb-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 h-[76px]">
                <div className="h-6 w-10 bg-[#F3F4F6] animate-pulse rounded-md mb-2" />
                <div className="h-3 w-16 bg-[#F3F4F6] animate-pulse rounded-md" />
              </div>
            ))
          ) : (
            statCards.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                dotColor={stat.dotColor}
              />
            ))
          )}
        </div>

        {/* Main grid: pending requests + who's in office */}
        <div className="grid grid-cols-[1fr_1.05fr] gap-4 mb-4">
          <PendingRequestsPanel />
          <WhoIsInOffice rows={inOffice} loading={loading} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
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
