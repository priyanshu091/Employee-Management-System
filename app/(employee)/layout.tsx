import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import { ToastProvider } from '@/components/shared/Toast'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F3F4F6]">
        <EmployeeSidebar />
        <div className="ml-[200px] flex flex-col flex-1 min-h-screen">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
