'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Umbrella,
  Home,
  FileEdit,
  Bell,
  LucideIcon,
  LogOut,
  QrCode,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Avatar from '@/components/shared/Avatar'
import { useSession } from '@/lib/hooks/useSession'
import { useCompanySettings } from '@/lib/hooks/useCompanySettings'
import { useUnread } from '@/components/employee/UnreadProvider'
import InstallPWA from '@/components/shared/InstallPWA'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

// FIX 5: Removed hardcoded badge values from NAV_ITEMS
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Scan QR',        href: '/scan',          icon: QrCode },
  { label: 'Attendance',     href: '/attendance',    icon: Calendar },
  { label: 'Leave',          href: '/leave',         icon: Umbrella },
  { label: 'Work from home', href: '/wfh',           icon: Home },
  { label: 'Corrections',    href: '/correction',    icon: FileEdit },
  { label: 'Notifications',  href: '/notifications', icon: Bell },
]

interface EmployeeSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function EmployeeSidebar({ isOpen, onClose }: EmployeeSidebarProps) {
  const pathname = usePathname()
  const { profile, loading } = useSession()
  const displayName = loading ? '...' : (profile?.full_name ?? 'Employee')
  const { settings } = useCompanySettings()
  const unreadCount = useUnread()
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
          // Mobile: slide in/out; Desktop: always visible
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3 h-[73px]">
          {settings?.logo_url && (
            <img src={settings.logo_url} alt={settings.company_name} className="h-8 w-8 object-contain rounded" />
          )}
          <div className="flex flex-col overflow-hidden">
            <p className="text-[14px] font-semibold text-[#111827] line-clamp-2 leading-snug">{settings?.company_name || 'Feelify EMS'}</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">Startup Edition</p>
          </div>
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
                {/* FIX 5: Real unread count on Notifications only */}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-[#DC2626] text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Install PWA Prompt */}
        <InstallPWA />

        {/* Avatar row — bottom of sidebar */}
        <div className="p-3 border-t border-[#E5E7EB]">
          {/* User info row */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={profile?.full_name ?? ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#111827] truncate">
                {profile?.full_name ?? 'Loading...'}
              </p>
              <p className="text-[10px] text-[#6B7280] truncate">
                {profile?.employee_id ?? ''}
              </p>
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
