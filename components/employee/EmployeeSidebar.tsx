'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Umbrella,
  Home,
  FileEdit,
  Bell,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Avatar from '@/components/shared/Avatar'
import { useSession } from '@/lib/hooks/useSession'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      href: '/dashboard',    icon: LayoutDashboard },
  { label: 'Attendance',     href: '/attendance',   icon: Calendar },
  { label: 'Leave',          href: '/leave',        icon: Umbrella,  badge: 1 },
  { label: 'Work from home', href: '/wfh',          icon: Home },
  { label: 'Corrections',    href: '/correction',   icon: FileEdit },
  { label: 'Notifications',  href: '/notifications',icon: Bell, badge: 3 },
]

export default function EmployeeSidebar() {
  const pathname = usePathname()
  const { profile, loading } = useSession()
  const displayName = loading ? '...' : (profile?.full_name ?? 'Employee')

  return (
    <aside className="w-[200px] bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <p className="text-[15px] font-semibold text-[#111827]">AttendEase</p>
        <p className="text-[11px] text-[#6B7280] mt-0.5">Startup Edition</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto" aria-label="Employee navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors duration-150',
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6]'
              )}
              aria-current={isActive ? 'page' : undefined}
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
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#E5E7EB] flex items-center gap-2">
        <Avatar name={displayName} size="md" />
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#111827] truncate">{displayName}</p>
          <p className="text-[10px] text-[#6B7280]">Employee</p>
        </div>
      </div>
    </aside>
  )
}
