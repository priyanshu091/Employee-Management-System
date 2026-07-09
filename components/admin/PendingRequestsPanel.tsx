'use client'

import { useState, useEffect, useCallback } from 'react'
import { Umbrella, Home, FileEdit } from 'lucide-react'
import Link from 'next/link'
import RejectReasonModal from './RejectReasonModal'
import { useToast } from '@/components/shared/Toast'
import { getPendingRequests, reviewRequest } from '@/lib/api/admin'
import type {
  LeaveRequestWithProfile, WFHRequestWithProfile, CorrectionRequestWithProfile,
} from '@/types'

type RequestCategory = 'leave' | 'wfh' | 'correction'

type AnyRequest = LeaveRequestWithProfile | WFHRequestWithProfile | CorrectionRequestWithProfile

const TABS: { key: RequestCategory; label: string }[] = [
  { key: 'leave', label: 'Leave' },
  { key: 'wfh', label: 'WFH' },
  { key: 'correction', label: 'Correction' },
]

const CATEGORY_ICON = {
  leave: { icon: Umbrella, bg: '#FFFBEB', color: '#D97706' },
  wfh: { icon: Home, bg: '#EFF6FF', color: '#2563EB' },
  correction: { icon: FileEdit, bg: '#FEF2F2', color: '#DC2626' },
}

interface RejectTarget {
  category: RequestCategory
  id: string
  employeeName: string
}

function detailsFor(category: RequestCategory, req: AnyRequest): string {
  if (category === 'leave') {
    const r = req as LeaveRequestWithProfile
    return `${r.leave_type} · ${r.start_date} to ${r.end_date} · ${r.reason}`
  }
  if (category === 'wfh') {
    const r = req as WFHRequestWithProfile
    return `${r.date} · ${r.reason}`
  }
  const r = req as CorrectionRequestWithProfile
  return `${r.date} · ${r.reason}`
}

export default function PendingRequestsPanel() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<RequestCategory>('leave')
  const [requests, setRequests] = useState<Record<RequestCategory, AnyRequest[]>>({
    leave: [], wfh: [], correction: [],
  })
  const [loading, setLoading] = useState(true)
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null)

  useEffect(() => {
    getPendingRequests().then((data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [])

  const tabRequests = requests[activeTab]
  const countFor = (cat: RequestCategory) => requests[cat].length

  const handleApprove = useCallback(async (category: RequestCategory, id: string, name: string) => {
    const res = await reviewRequest(category, id, 'approved')
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    setRequests((prev) => ({ ...prev, [category]: prev[category].filter((r) => r.id !== id) }))
    showToast(`Approved — ${name}`, 'success')
  }, [showToast])

  const handleRejectConfirm = useCallback(async (reason: string) => {
    if (!rejectTarget) return
    const res = await reviewRequest(rejectTarget.category, rejectTarget.id, 'rejected', reason)
    if (res.error) {
      showToast(res.error, 'error')
      setRejectTarget(null)
      return
    }
    setRequests((prev) => ({
      ...prev,
      [rejectTarget.category]: prev[rejectTarget.category].filter((r) => r.id !== rejectTarget.id),
    }))
    showToast(`Rejected — ${rejectTarget.employeeName}`, 'error')
    setRejectTarget(null)
  }, [rejectTarget, showToast])

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-medium text-[#111827]">Pending requests</h2>
          <Link
            href="/admin/requests"
            className="text-[12px] text-[#4F46E5] hover:underline"
          >
            See all →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#F3F4F6] rounded-lg p-1 gap-1 mb-3">
          {TABS.map((tab) => {
            const count = countFor(tab.key)
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-center py-1.5 text-[12px] rounded-md transition-colors duration-150 ${
                  activeTab === tab.key
                    ? 'bg-white text-[#111827] font-medium border border-[#E5E7EB]'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Request items */}
        {loading ? (
          <div className="flex flex-col gap-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#F3F4F6] animate-pulse rounded-md" />
            ))}
          </div>
        ) : tabRequests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[#6B7280]">No pending requests</p>
          </div>
        ) : (
          <div>
            {tabRequests.map((req) => {
              const { icon: Icon, bg, color } = CATEGORY_ICON[activeTab]
              const employeeName = req.profile?.full_name ?? 'Unknown'
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 py-3 border-b border-[#F3F4F6] last:border-0"
                >
                  {/* Category icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={14} style={{ color }} strokeWidth={1.75} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111827] leading-tight">
                      {employeeName}
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                      {detailsFor(activeTab, req)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(activeTab, req.id, employeeName)}
                      className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-3 py-1.5 rounded-md text-[11px] font-medium hover:bg-green-100 transition-colors duration-150"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectTarget({ category: activeTab, id: req.id, employeeName })}
                      className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-3 py-1.5 rounded-md text-[11px] font-medium hover:bg-red-100 transition-colors duration-150"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectTarget && (
        <RejectReasonModal
          employeeName={rejectTarget.employeeName}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleRejectConfirm}
        />
      )}
    </>
  )
}
