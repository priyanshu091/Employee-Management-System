import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/shared/Toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F3F4F6]">
        <AdminSidebar />
        <div className="ml-[200px] flex flex-col flex-1 min-h-screen">
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}
