'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import { ToastProvider } from '@/components/shared/Toast'
import { UnreadProvider } from '@/components/employee/UnreadProvider'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <ToastProvider>
      <UnreadProvider>
        <div className="flex min-h-screen bg-[#F3F4F6]">
          <EmployeeSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          {/* FIX 3: lg:ml-[200px] so mobile has no left margin */}
          <div className="lg:ml-[200px] flex flex-col flex-1 min-h-screen w-full">
            {/* Pass onMenuClick via a context or cloneElement isn't ideal.
                Instead, children pages include their own topbar.
                We pass a data attribute and let CSS handle visibility,
                but the cleanest approach is a context. */}
            <SidebarMenuContext.Provider value={() => setSidebarOpen(true)}>
              {children}
            </SidebarMenuContext.Provider>
          </div>
        </div>
      </UnreadProvider>
    </ToastProvider>
  )
}

// Context so child topbars can trigger the sidebar open
import { createContext, useContext } from 'react'

export const SidebarMenuContext = createContext<() => void>(() => {})
export function useSidebarMenu() {
  return useContext(SidebarMenuContext)
}
