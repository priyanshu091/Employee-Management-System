'use client'

import { useState, useEffect } from 'react'
import { Umbrella } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import PageHeader from '@/components/shared/PageHeader'
import FullRequestCard from '@/components/employee/FullRequestCard'
import ApplyLeaveModal from '@/components/employee/ApplyLeaveModal'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import type { LeaveRequest } from '@/types'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateRange(start: string, end: string) {
  return start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`
}

function fmtDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const days = Math.round(ms / 86_400_000) + 1
  return `${days} day${days !== 1 ? 's' : ''}`
}

export default function LeavePage() {
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leave')
      .then((r) => r.json())
      .then((json) => { if (!json.error) setRequests(json.data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (data: {
    leaveType: string
    startDate: string
    endDate: string
    reason: string
  }) => {
    const res = await fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leave_type: data.leaveType,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      }),
    })
    const json = await res.json()

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to submit leave request.', 'error')
      return
    }

    setRequests((prev) => [json.data, ...prev])
    showToast('Leave request submitted successfully.', 'success')
  }

  return (
    <>
      <EmployeeTopbar title="Leave" unreadCount={3} />
      <main className="flex-1 p-5">
        <PageHeader
          title="Leave Requests"
          subtitle="Manage your time-off requests"
          action={{ label: '+ Apply for leave', onClick: () => setShowModal(true) }}
        />

        {!loading && requests.length === 0 ? (
          <EmptyState
            icon={Umbrella}
            heading="No leave requests yet"
            sub="Apply for time off and track approvals here."
            ctaLabel="Apply for leave"
            onCta={() => setShowModal(true)}
          />
        ) : (
          <div>
            {requests.map((r) => (
              <FullRequestCard
                key={r.id}
                icon={Umbrella}
                iconBg="#FFFBEB"
                iconColor="#D97706"
                typeLabel={r.leave_type}
                dateRange={fmtDateRange(r.start_date, r.end_date)}
                duration={fmtDuration(r.start_date, r.end_date)}
                reason={r.reason}
                submittedOn={fmtDate(r.created_at)}
                status={r.status}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ApplyLeaveModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
