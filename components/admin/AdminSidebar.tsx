'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Inbox,
  CalendarPlus,
  BarChart2,
  History,
  Settings,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Avatar from '@/components/shared/Avatar'
import { useSession } from '@/lib/hooks/useSession'
import { PENDING_REQUESTS } from '@/lib/mock/admin'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

const NAV_MAIN: NavItem[] = [
  { label: 'Dashboard',  href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Employees',  href: '/admin/employees',  icon: Users            },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarDays     },
  {
    label: 'Requests',
    href: '/admin/requests',
    icon: Inbox,
    badge: PENDING_REQUESTS.length,
  },
]

const NAV_MANAGE: NavItem[] = [
  { label: 'Holidays',  href: '/admin/holidays', icon: CalendarPlus },
  { label: 'Reports',   href: '/admin/reports',  icon: BarChart2    },
  { label: 'Audit log', href: '/admin/audit',    icon: History      },
  { label: 'Settings',  href: '/admin/settings', icon: Settings     },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { profile, loading } = useSession()
  const displayName = loading ? '...' : (profile?.full_name ?? 'Admin')

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const active = isActive(item.href)
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors duration-150',
          active
            ? 'bg-[#EEF2FF] text-[#4F46E5]'
            : 'text-[#6B7280] hover:bg-[#F3F4F6]'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span className="bg-[#DC2626] text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
            {item.badge}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <aside className="w-[200px] bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <p className="text-[15px] font-semibold text-[#111827]">AttendEase</p>
        <p className="text-[11px] text-[#6B7280] mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto" aria-label="Admin navigation">
        {NAV_MAIN.map((item) => <NavLink key={item.href} item={item} />)}

        {/* Section divider */}
        <p className="text-[10px] text-[#9CA3AF] px-3 mt-4 mb-1 font-medium tracking-wide uppercase">
          Manage
        </p>

        {NAV_MANAGE.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Admin user row */}
      <div className="p-3 border-t border-[#E5E7EB] flex items-center gap-2">
        <Avatar name={displayName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-[#111827] truncate">{displayName}</p>
          <span className="inline-block text-[10px] bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full leading-tight mt-0.5">
            Admin
          </span>
        </div>
      </div>
    </aside>
  )
}
