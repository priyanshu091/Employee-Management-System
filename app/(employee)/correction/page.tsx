'use client'

import { useState, useEffect } from 'react'
import { FileEdit } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import PageHeader from '@/components/shared/PageHeader'
import FullRequestCard from '@/components/employee/FullRequestCard'
import ApplyCorrectionModal from '@/components/employee/ApplyCorrectionModal'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import type { CorrectionRequest } from '@/types'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// DB time columns come back as "HH:MM:SS" — format to "h:MM AM/PM"
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

export default function CorrectionPage() {
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/correction')
      .then((r) => r.json())
      .then((json) => { if (!json.error) setRequests(json.data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (data: {
    date: string
    reason: string
    checkIn: string
    checkOut: string
  }) => {
    const res = await fetch('/api/correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: data.date,
        reason: data.reason,
        requested_check_in: data.checkIn || null,
        requested_check_out: data.checkOut || null,
      }),
    })
    const json = await res.json()

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to submit correction request.', 'error')
      return
    }

    setRequests((prev) => [json.data, ...prev])
    showToast('Correction request submitted. Admin will review it.', 'success')
  }

  return (
    <>
      <EmployeeTopbar title="Corrections" />
      <main className="flex-1 p-5">
        <PageHeader
          title="Attendance Corrections"
          subtitle="Fix missing or incorrect attendance records"
          action={{ label: '+ Request correction', onClick: () => setShowModal(true) }}
        />

        {!loading && requests.length === 0 ? (
          <EmptyState
            icon={FileEdit}
            heading="No correction requests"
            sub="Submit a correction if you missed check-in or check-out."
            ctaLabel="Request correction"
            onCta={() => setShowModal(true)}
          />
        ) : (
          <div>
            {requests.map((r) => {
              const timingParts: string[] = []
              if (r.requested_check_in)  timingParts.push(`Check-in: ${fmtTime(r.requested_check_in)}`)
              if (r.requested_check_out) timingParts.push(`Check-out: ${fmtTime(r.requested_check_out)}`)

              return (
                <FullRequestCard
                  key={r.id}
                  icon={FileEdit}
                  iconBg="#FEF2F2"
                  iconColor="#DC2626"
                  typeLabel="Attendance correction"
                  dateRange={fmtDate(r.date)}
                  reason={r.reason}
                  submittedOn={fmtDate(r.created_at)}
                  status={r.status}
                  extraInfo={timingParts.length > 0 ? timingParts.join(' · ') : undefined}
                />
              )
            })}
          </div>
        )}
      </main>

      {showModal && (
        <ApplyCorrectionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
