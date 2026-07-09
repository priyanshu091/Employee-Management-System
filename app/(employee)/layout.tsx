import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import { ToastProvider } from '@/components/shared/Toast'
import { UnreadProvider } from '@/components/employee/UnreadProvider'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UnreadProvider>
        <div className="flex min-h-screen bg-[#F3F4F6]">
          <EmployeeSidebar />
          <div className="ml-[200px] flex flex-col flex-1 min-h-screen">
            {children}
          </div>
        </div>
      </UnreadProvider>
    </ToastProvider>
  )
}
