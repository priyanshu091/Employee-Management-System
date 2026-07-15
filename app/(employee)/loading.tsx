import { Loader2 } from 'lucide-react'

export default function EmployeeLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] w-full text-[#6B7280]">
      <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-4" />
      <p className="text-[14px] font-medium animate-pulse">Loading...</p>
    </div>
  )
}
