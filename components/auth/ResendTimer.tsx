'use client'

import { useState, useEffect, useCallback } from 'react'

interface ResendTimerProps {
  onResend: () => void
}

export default function ResendTimer({ onResend }: ResendTimerProps) {
  const [seconds, setSeconds] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  const handleResend = useCallback(() => {
    if (!canResend) return
    onResend()
    setSeconds(60)
    setCanResend(false)
  }, [canResend, onResend])

  return (
    <p className="text-center text-[13px] text-[#6B7280]">
      Didn&apos;t receive it?{' '}
      {canResend ? (
        <button
          onClick={handleResend}
          className="text-[#4F46E5] font-medium hover:underline focus:outline-none focus:underline"
        >
          Resend OTP
        </button>
      ) : (
        <span className="text-[#9CA3AF]">
          Resend in 0:{String(seconds).padStart(2, '0')}
        </span>
      )}
    </p>
  )
}
