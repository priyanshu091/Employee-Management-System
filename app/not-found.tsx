import { SearchX } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-5">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB] max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#F3F4F6] text-[#6B7280] rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX size={32} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[20px] font-semibold text-[#111827] mb-2">Page not found</h1>
        <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-200"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}
