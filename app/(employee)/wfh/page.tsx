'use client'

import { useState, useEffect } from 'react'
import { Home } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import PageHeader from '@/components/shared/PageHeader'
import FullRequestCard from '@/components/employee/FullRequestCard'
import ApplyWFHModal from '@/components/employee/ApplyWFHModal'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import type { WFHRequest } from '@/types'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function WFHPage() {
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [requests, setRequests] = useState<WFHRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wfh')
      .then((r) => r.json())
      .then((json) => { if (!json.error) setRequests(json.data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (data: { date: string; reason: string }) => {
    const res = await fetch('/api/wfh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: data.date, reason: data.reason }),
    })
    const json = await res.json()

    if (!res.ok || json.error) {
      showToast(json.error ?? 'Failed to submit WFH request.', 'error')
      return
    }

    setRequests((prev) => [json.data, ...prev])
    showToast('WFH request submitted. Waiting for admin approval.', 'success')
  }

  return (
    <>
      <EmployeeTopbar title="Work from Home" unreadCount={3} />
      <main className="flex-1 p-5">
        <PageHeader
          title="Work from Home"
          subtitle="Request remote working days"
          action={{ label: '+ Request WFH', onClick: () => setShowModal(true) }}
        />

        {!loading && requests.length === 0 ? (
          <EmptyState
            icon={Home}
            heading="No WFH requests yet"
            sub="Request to work from home and track admin approvals here."
            ctaLabel="Request WFH"
            onCta={() => setShowModal(true)}
          />
        ) : (
          <div>
            {requests.map((r) => (
              <FullRequestCard
                key={r.id}
                icon={Home}
                iconBg="#EFF6FF"
                iconColor="#2563EB"
                typeLabel="Work from home"
                dateRange={fmtDate(r.date)}
                reason={r.reason}
                submittedOn={fmtDate(r.created_at)}
                status={r.status}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ApplyWFHModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
