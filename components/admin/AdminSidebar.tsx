'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Avatar from '@/components/shared/Avatar'
import { useSession } from '@/lib/hooks/useSession'
import { useCompanySettings } from '@/lib/hooks/useCompanySettings'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_MAIN: NavItem[] = [
  { label: 'Dashboard',  href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Employees',  href: '/admin/employees',  icon: Users            },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarDays     },
  { label: 'Requests',  href: '/admin/requests',   icon: Inbox            },
]

const NAV_MANAGE: NavItem[] = [
  { label: 'Holidays',  href: '/admin/holidays', icon: CalendarPlus },
  { label: 'Reports',   href: '/admin/reports',  icon: BarChart2    },
  { label: 'Audit log', href: '/admin/audit',    icon: History      },
  { label: 'Settings',  href: '/admin/settings', icon: Settings     },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { profile, loading } = useSession()
  const displayName = loading ? '...' : (profile?.full_name ?? 'Admin')
  const { settings } = useCompanySettings()
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/auth/login')
      router.refresh()
    }
  }

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
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-[200px] bg-white border-r border-[#E5E7EB] flex flex-col h-screen fixed left-0 top-0 z-50',
          'transform transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center h-[73px]">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={settings.company_name} className="max-h-full max-w-full object-contain" />
          ) : (
            <div>
              <p className="text-[15px] font-semibold text-[#111827] truncate">{settings?.company_name || 'FeelifyEMS'}</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">Admin Panel</p>
            </div>
          )}
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

        {/* Avatar row — bottom of sidebar */}
        <div className="p-3 border-t border-[#E5E7EB]">
          {/* User info row */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={displayName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-[#111827] truncate">{displayName}</p>
              <span className="inline-block text-[10px] bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full leading-tight mt-0.5">
                Admin
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg
                       text-[12px] text-[#6B7280] hover:bg-[#FEF2F2] 
                       hover:text-[#DC2626] transition-colors duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  )
}
