'use client'

import { Menu } from 'lucide-react'
import { formatDate } from '@/lib/utils/time'
import { useAdminSidebarMenu } from '@/app/(admin)/layout'

interface AdminTopbarProps {
  title: string
  action?: React.ReactNode
}

export default function AdminTopbar({ title, action }: AdminTopbarProps) {
  const today = formatDate(new Date())
  const openSidebar = useAdminSidebarMenu()

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
        {action}
      </div>
    </header>
  )
}
