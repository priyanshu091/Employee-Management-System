'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import OTPInput from '@/components/auth/OTPInput'

function Spinner({ color = 'white' }: { color?: string }) {
  return (
    <div
      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mx-auto"
      style={{ borderColor: color, borderTopColor: 'transparent' }}
      aria-hidden="true"
    />
  )
}

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const [step, setStep] = useState<'otp' | 'remember-me'>('otp')
  const [redirectTo, setRedirectTo] = useState('/dashboard')

  useEffect(() => {
    const stored = sessionStorage.getItem('otp_email')
    if (!stored) {
      router.replace('/auth/login')
      return
    }
    setEmail(stored)
  }, [router])

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const maskEmail = (e: string) => {
    const [user, domain] = e.split('@')
    if (!domain) return e
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`
  }

  const handleOTPChange = useCallback((val: string[]) => {
    setOtp(val)
    setHasError(false)
    setErrorMsg('')
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const code = otp.join('')

    if (code.length < 6) {
      setHasError(true)
      setErrorMsg('Please enter all 6 digits.')
      return
    }

    setLoading(true)
    setHasError(false)
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        setHasError(true)
        setErrorMsg(json.error ?? 'Incorrect OTP. Please try again.')
        setOtp(Array(6).fill(''))
        return
      }

      // Success - move to remember-me step
      setRedirectTo(json.data.redirectTo ?? '/dashboard')
      setStep('remember-me')
      sessionStorage.removeItem('otp_email')
    } catch {
      setHasError(true)
      setErrorMsg('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRememberMeChoice = async (remember: boolean) => {
    setLoading(true)
    try {
      await fetch('/api/auth/extend-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rememberMe: remember }),
      })
    } catch (err) {
      console.error('Failed to extend session:', err)
    }

    setSuccess(true)
    await new Promise((res) => setTimeout(res, 600))
    router.push(redirectTo)
  }

  const handleResend = useCallback(async () => {
    setResendLoading(true)
    setOtp(Array(6).fill(''))
    setHasError(false)
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setHasError(true)
        setErrorMsg(json.error ?? 'Failed to resend OTP. Please try again.')
        return // do NOT restart countdown
      }
      setCountdown(60)
      setCanResend(false)
      setErrorMsg('')
    } catch {
      setHasError(true)
      setErrorMsg('Network error. Could not resend OTP.')
    } finally {
      setResendLoading(false)
    }
  }, [email])

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#F3F4F6]">
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8 w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-[#16A34A]" size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-[16px] font-semibold text-[#111827]">Signed In!</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">Redirecting to your dashboard...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  if (step === 'remember-me') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#F3F4F6]">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8">
            <div className="mb-6 text-center">
              <h1 className="text-[18px] font-semibold text-[#111827]">Stay signed in?</h1>
              <p className="text-[13px] text-[#6B7280] mt-2 leading-relaxed">
                Do this to reduce the number of times you are asked to sign in on this device.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleRememberMeChoice(true)}
                disabled={loading}
                className="
                  w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-white
                  bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3]
                  transition-colors duration-150 disabled:opacity-50
                "
              >
                Yes
              </button>
              <button
                onClick={() => handleRememberMeChoice(false)}
                disabled={loading}
                className="
                  w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-[#374151]
                  bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] active:bg-[#F3F4F6]
                  transition-colors duration-150 disabled:opacity-50
                "
              >
                No
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#F3F4F6]">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8">
          {/* Back */}
          <button
            onClick={() => router.push('/auth/login')}
            className="
              flex items-center gap-1.5 text-[13px] text-[#6B7280]
              hover:text-[#111827] transition-colors duration-150 mb-6
              focus:outline-none focus:underline
            "
            aria-label="Back to login"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back
          </button>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[18px] font-semibold text-[#111827]">
              Check your email
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-[#111827]">{maskEmail(email)}</span>
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <OTPInput
                value={otp}
                onChange={handleOTPChange}
                hasError={hasError}
              />
              {errorMsg && (
                <p
                  className="mt-3 text-[12px] text-[#DC2626] text-center"
                  role="alert"
                >
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="
                w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-white
                bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3]
                transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2
                mb-4
              "
            >
              {loading ? <Spinner /> : 'Verify OTP'}
            </button>

            <p className="text-center text-[13px] text-[#6B7280]">
              Didn&apos;t receive it?{' '}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[#4F46E5] font-medium hover:underline focus:outline-none focus:underline disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <span className="text-[#9CA3AF]">
                  Resend in 0:{String(countdown).padStart(2, '0')}
                </span>
              )}
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
