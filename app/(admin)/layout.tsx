'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/shared/Toast'

// Context so AdminTopbar in child pages can trigger sidebar open
export const AdminSidebarMenuContext = createContext<() => void>(() => {})
export function useAdminSidebarMenu() {
  return useContext(AdminSidebarMenuContext)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F3F4F6]">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* FIX 3: lg:ml-[200px] so mobile has no left margin */}
        <div className="lg:ml-[200px] flex flex-col flex-1 min-h-screen w-full">
          <AdminSidebarMenuContext.Provider value={() => setSidebarOpen(true)}>
            {children}
          </AdminSidebarMenuContext.Provider>
        </div>
      </div>
    </ToastProvider>
  )
}
