'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Building2, Home, Clock } from 'lucide-react'
import { haversineKm } from '@/lib/utils/geo'
import type { Attendance } from '@/types/index'
import Link from 'next/link'

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      <p className="text-[13px] text-[#6B7280]">{message}</p>
    </div>
  )
}

function formatTime(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--'
}

type PageState = 'validating' | 'error' | 'checkin' | 'checkout' | 'done' | 'success'

function QRCheckinInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [pageState, setPageState] = useState<PageState>('validating')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedType, setSelectedType] = useState<'office' | 'wfh' | null>(null)
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null)
  const [successType, setSuccessType] = useState<'checkin' | 'checkout'>('checkin')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'done'>('idle')

  useEffect(() => {
    async function init() {
      const token = searchParams.get('token')
      if (!token) {
        setPageState('error')
        setErrorMsg('Invalid QR code. Please scan the office QR again.')
        return
      }

      try {
        const validateRes = await fetch('/api/qr/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
          }),
        })
        
        if (validateRes.status === 401) {
          router.push(`/auth/login?redirect=${encodeURIComponent(`/qr-checkin?token=${token}`)}`)
          return
        }
        
        const validateData = await validateRes.json()

        if (validateData.error) {
          setPageState('error')
          setErrorMsg(validateData.error)
          return
        }

        const action = validateData.data?.action
        
        if (action === 'checkin') {
          setPageState('checkin')
        } else if (action === 'checkout') {
          setTodayRecord(validateData.data.record)
          setPageState('checkout')
        } else {
           setPageState('error')
           setErrorMsg('Unexpected response from server.')
        }
      } catch (err) {
        setPageState('error')
        setErrorMsg('Network error. Please try again.')
      }
    }

    init()
  }, [searchParams])

  async function handleCheckIn() {
    if (!selectedType) return
    setActionLoading(true)
    setActionError('')

    try {
      if (selectedType === 'office') {
        setGpsStatus('checking')

        // Step 1: get office settings
        const settingsRes = await fetch('/api/settings')
        const settingsData = await settingsRes.json()
        const settings = settingsData.data

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
          })
        })

        setGpsStatus('done')

        // Step 3: check distance
        const distance = haversineKm(
          position.coords.latitude,
          position.coords.longitude,
          settings.office_lat,
          settings.office_lng
        )

        if (distance > settings.allowed_radius_km) {
          setActionError(`You are ${distance.toFixed(1)}km from office. Move closer or choose WFH.`)
          setActionLoading(false)
          setGpsStatus('idle')
          return
        }

        // Step 4: check in for office
        const res = await fetch('/api/attendance/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'office', lat: position.coords.latitude, lng: position.coords.longitude }),
        })
        const data = await res.json()

        if (data.error) {
          setActionError(data.error)
        } else {
          setSuccessType('checkin')
          setPageState('success')
          setTimeout(() => router.push('/dashboard'), 3000)
        }
      } else if (selectedType === 'wfh') {
        const { getTodayIST } = await import('@/lib/utils/time')
        const res = await fetch('/api/wfh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: getTodayIST(), reason: 'WFH request from QR check-in' }),
        })
        const data = await res.json()
        
        if (data.error) {
          setActionError(data.error)
        } else {
          setSuccessType('checkin')
          setPageState('success')
          setTimeout(() => router.push('/dashboard'), 3000)
        }
      }
    } catch (err) {
      setActionError('Something went wrong. Please try again.')
    } finally {
      setActionLoading(false)
      setGpsStatus('idle')
    }
  }

  async function handleCheckOut() {
    setActionLoading(true)
    setActionError('')
    try {
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.error) {
        setActionError(data.error)
      } else {
        setSuccessType('checkout')
        setPageState('success')
        setTimeout(() => router.push('/dashboard'), 3000)
      }
    } catch {
      setActionError('Something went wrong. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  if (pageState === 'validating') {
    return <LoadingState message="Verifying QR..." />
  }

  if (pageState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle size={40} color="#DC2626" />
        <h2 className="text-[16px] font-semibold text-[#111827] mt-3">Invalid QR Code</h2>
        <p className="text-[13px] text-[#6B7280] mt-1 text-center px-4">{errorMsg}</p>
        <button
          onClick={() => router.push('/scan')}
          className="mt-6 border border-[#E5E7EB] text-[#374151] rounded-lg px-5 py-2 text-[13px] transition-colors duration-150 hover:bg-[#F9FAFB]"
        >
          Scan Again
        </button>
      </div>
    )
  }

  if (pageState === 'checkin') {
    const todayDateStr = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return (
      <div className="max-w-sm mx-auto mt-6 px-4">
        <div className="inline-flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] text-[11px] font-medium px-3 py-1 rounded-full mb-4">
          <CheckCircle size={14} />
          QR Verified
        </div>
        <h1 className="text-[18px] font-semibold text-[#111827]">Mark Attendance</h1>
        <p className="text-[13px] text-[#6B7280] mt-1 mb-5">{todayDateStr}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setSelectedType('office')}
            className={`border rounded-xl p-4 cursor-pointer transition-colors duration-150 text-center flex flex-col items-center ${
              selectedType === 'office'
                ? 'border-[#4F46E5] bg-[#EEF2FF]'
                : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
            }`}
          >
            <Building2 size={24} color={selectedType === 'office' ? '#4F46E5' : '#6B7280'} />
            <p className="text-[13px] font-medium mt-2">Office</p>
          </div>
          
          <div
            onClick={() => setSelectedType('wfh')}
            className={`border rounded-xl p-4 cursor-pointer transition-colors duration-150 text-center flex flex-col items-center ${
              selectedType === 'wfh'
                ? 'border-[#4F46E5] bg-[#EEF2FF]'
                : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'
            }`}
          >
            <Home size={24} color={selectedType === 'wfh' ? '#4F46E5' : '#6B7280'} />
            <p className="text-[13px] font-medium mt-2">Work from Home</p>
          </div>
        </div>

        {selectedType === 'office' && gpsStatus === 'checking' && (
          <p className="text-[12px] text-[#6B7280] mt-3 text-center">Checking your location...</p>
        )}
        
        {selectedType === 'office' && gpsStatus === 'idle' && selectedType && (
          <p className="text-[12px] text-[#6B7280] mt-3 text-center">Your location will be verified</p>
        )}
        
        {actionError && (
          <p className="text-[12px] text-[#DC2626] mt-3 text-center">{actionError}</p>
        )}
        
        <button
          onClick={handleCheckIn}
          disabled={!selectedType || actionLoading || gpsStatus === 'checking'}
          className={`mt-5 w-full rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 ${
            !selectedType || actionLoading || gpsStatus === 'checking'
              ? 'bg-[#4F46E5] opacity-50 cursor-not-allowed text-white'
              : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
          }`}
        >
          {actionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Checking in...
            </span>
          ) : (
            'Check In'
          )}
        </button>
      </div>
    )
  }

  if (pageState === 'checkout') {
    return (
      <div className="max-w-sm mx-auto mt-6 px-4">
        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-medium px-3 py-1 rounded-full mb-4">
          <Clock size={14} />
          Currently Checked In
        </div>
        <h1 className="text-[18px] font-semibold text-[#111827]">Check Out</h1>
        <p className="text-[13px] text-[#6B7280] mt-1">
          Checked in at {todayRecord ? formatTime(todayRecord.check_in) : '--'}
        </p>

        {actionError && (
          <p className="text-[12px] text-[#DC2626] mt-4">{actionError}</p>
        )}

        <button
          onClick={handleCheckOut}
          disabled={actionLoading}
          className={`mt-5 w-full border rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 ${
            actionLoading
              ? 'border-[#DC2626] text-[#DC2626] opacity-50 cursor-not-allowed'
              : 'border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]'
          }`}
        >
          {actionLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
              Checking out...
            </span>
          ) : (
            'Check Out'
          )}
        </button>
      </div>
    )
  }

  if (pageState === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle size={48} color="#16A34A" />
        <h2 className="text-[16px] font-semibold text-[#111827] mt-3">Attendance Marked</h2>
        <p className="text-[13px] text-[#6B7280] mt-1">
          Check-in: {todayRecord ? formatTime(todayRecord.check_in) : '--'} &middot; Check-out: {todayRecord ? formatTime(todayRecord.check_out) : '--'}
        </p>
        <Link href="/dashboard" className="mt-5 inline-block text-[#4F46E5] text-[13px] underline">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <CheckCircle size={56} color="#16A34A" />
        <h2 className="text-[18px] font-semibold mt-3 text-[#111827]">
          {successType === 'checkin' ? 'Checked In!' : 'Checked Out!'}
        </h2>
        <p className="text-[13px] text-[#6B7280] mt-1">
          {successType === 'checkin' ? 'Have a great day!' : 'See you tomorrow!'}
        </p>
        <p className="text-[12px] text-[#9CA3AF] mt-3">Redirecting to dashboard...</p>
      </div>
    )
  }

  return null
}

import EmployeeTopbar from '@/components/employee/EmployeeTopbar'

export default function QRCheckinPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <EmployeeTopbar title="QR Check-in" />
      <Suspense fallback={<LoadingState message="Loading..." />}>
        <QRCheckinInner />
      </Suspense>
    </div>
  )
}
