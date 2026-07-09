import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
      <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-4" />
      <p className="text-[13px] font-medium animate-pulse">Loading data...</p>
    </div>
  )
}
