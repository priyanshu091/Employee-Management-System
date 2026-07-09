'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Spinner() {
  return (
    <div
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"
      aria-hidden="true"
    />
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const json = await res.json()

    if (!res.ok || json.error) {
      setLoading(false)
      setError(json.error ?? 'Failed to send OTP. Please try again.')
      return
    }

    sessionStorage.setItem('otp_email', email)
    router.push('/auth/verify')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#F3F4F6]">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-8">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-[18px] font-semibold text-[#111827] leading-tight">
              AttendEase
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Startup Attendance System
            </p>
          </div>

          {/* FIX 4: Deactivated account warning */}
          {errorParam === 'inactive' && (
            <div className="bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg p-3 mb-4">
              <p className="text-[13px] text-[#DC2626]">
                Your account has been deactivated. Please contact your administrator.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-[#111827] mb-1.5"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="you@company.com"
                disabled={loading}
                className={`
                  w-full px-3 py-2.5 text-[13px] rounded-md border
                  transition-colors duration-150 outline-none
                  placeholder:text-[#9CA3AF] text-[#111827]
                  focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]
                  disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed
                  ${error ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB] bg-white'}
                `}
              />
              {error && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]" role="alert">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 px-4 rounded-lg text-[13px] font-medium text-white
                bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3]
                transition-colors duration-150
                disabled:opacity-70 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2
              "
            >
              {loading ? <Spinner /> : 'Send OTP'}
            </button>
          </form>

          {/* Helper */}
          <p className="mt-4 text-[12px] text-[#6B7280] text-center leading-relaxed">
            Enter your company email to receive a one-time password
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
