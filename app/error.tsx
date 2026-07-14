'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught an error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-5">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB] max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FEF2F2] text-[#DC2626] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[20px] font-semibold text-[#111827] mb-2">Something went wrong</h1>
        <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed">
          An unexpected error occurred. Our technical team has been notified. 
          Please try again or return to the dashboard.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-200"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full bg-white hover:bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB] py-2.5 rounded-xl text-[14px] font-medium transition-colors duration-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
