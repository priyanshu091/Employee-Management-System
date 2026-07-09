'use client'

import { Bell, Menu } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/time'
import { useUnread } from '@/components/employee/UnreadProvider'
import { useSidebarMenu } from '@/app/(employee)/layout'

interface EmployeeTopbarProps {
  title: string
}

export default function EmployeeTopbar({ title }: EmployeeTopbarProps) {
  const today = formatDate(new Date())
  const unreadCount = useUnread()
  const openSidebar = useSidebarMenu()

  return (
    <header className="h-[52px] bg-white border-b border-[#E5E7EB] px-5 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          className="lg:hidden p-2 rounded-md text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          onClick={openSidebar}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#111827]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-3 py-1 rounded-lg hidden sm:block">
          {today}
        </span>
        <Link
          href="/notifications"
          className="relative w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors duration-150"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={16} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full border-[1.5px] border-white" />
          )}
        </Link>
      </div>
    </header>
  )
}
