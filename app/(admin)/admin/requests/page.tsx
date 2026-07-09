'use client'

import { useState, useEffect, useCallback } from 'react'
import { Inbox, Umbrella, Home, FileEdit } from 'lucide-react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import RejectReasonModal from '@/components/admin/RejectReasonModal'
import Avatar from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import { getPendingRequests, reviewRequest } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'
import type {
  LeaveRequestWithProfile, WFHRequestWithProfile, CorrectionRequestWithProfile,
} from '@/types'

type RequestCategory = 'leave' | 'wfh' | 'correction'
type AnyRequest = LeaveRequestWithProfile | WFHRequestWithProfile | CorrectionRequestWithProfile

const TABS: { key: RequestCategory; label: string; icon: typeof Umbrella }[] = [
  { key: 'leave', label: 'Leave', icon: Umbrella },
  { key: 'wfh', label: 'WFH', icon: Home },
  { key: 'correction', label: 'Correction', icon: FileEdit },
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
  const times = [r.requested_check_in && `In: ${r.requested_check_in}`, r.requested_check_out && `Out: ${r.requested_check_out}`]
    .filter(Boolean).join(' · ')
  return `${r.date} · ${r.reason}${times ? ` · ${times}` : ''}`
}

export default function AdminRequestsPage() {
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
      <AdminTopbar title="Requests" />

      <main className="flex-1 p-5">
        {/* Tabs */}
        <div className="flex bg-white border border-[#E5E7EB] rounded-xl p-1.5 gap-1.5 mb-4 w-fit">
          {TABS.map((tab) => {
            const count = countFor(tab.key)
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-[13px] rounded-lg transition-colors duration-150',
                  activeTab === tab.key
                    ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                    : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                )}
              >
                <Icon size={14} strokeWidth={1.75} />
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    activeTab === tab.key ? 'bg-white text-[#4F46E5]' : 'bg-[#E5E7EB] text-[#6B7280]'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* List */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 border-b border-[#F3F4F6] last:border-0 bg-[#F3F4F6] animate-pulse" />
              ))}
            </div>
          ) : tabRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              heading="No pending requests"
              sub={`There are no pending ${activeTab} requests right now.`}
            />
          ) : (
            <div>
              {tabRequests.map((req) => {
                const { icon: Icon, bg, color } = CATEGORY_ICON[activeTab]
                const employeeName = req.profile?.full_name ?? 'Unknown'
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6] last:border-0"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}
                    >
                      <Icon size={16} style={{ color }} strokeWidth={1.75} />
                    </div>

                    <Avatar name={employeeName} size="sm" />

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#111827] leading-tight">
                        {employeeName}
                        <span className="text-[11px] text-[#9CA3AF] font-normal ml-1.5">{req.profile?.employee_id}</span>
                      </p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">
                        {detailsFor(activeTab, req)}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(activeTab, req.id, employeeName)}
                        className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-3.5 py-1.5 rounded-md text-[12px] font-medium hover:bg-green-100 transition-colors duration-150"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget({ category: activeTab, id: req.id, employeeName })}
                        className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] px-3.5 py-1.5 rounded-md text-[12px] font-medium hover:bg-red-100 transition-colors duration-150"
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
      </main>

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
