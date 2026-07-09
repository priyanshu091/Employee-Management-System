import { LucideIcon } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import type { RequestStatus } from '@/types'

interface FullRequestCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  typeLabel: string     // "Casual Leave"
  dateRange: string     // "17–18 Jul 2026"
  duration?: string     // "2 days" — leave only
  reason: string
  submittedOn: string   // "10 Jul 2026"
  status: RequestStatus
  extraInfo?: string    // e.g. "Check-in: 10:02 AM · Check-out: 07:10 PM"
}

export default function FullRequestCard({
  icon: Icon,
  iconBg,
  iconColor,
  typeLabel,
  dateRange,
  duration,
  reason,
  submittedOn,
  status,
  extraInfo,
}: FullRequestCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-3 flex items-start gap-4">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[13px] font-medium text-[#111827]">{typeLabel}</span>
            {duration && (
              <span className="ml-2 text-[11px] text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                {duration}
              </span>
            )}
          </div>
          <StatusBadge variant={status} className="flex-shrink-0" />
        </div>

        {/* Date range */}
        <p className="text-[12px] text-[#6B7280] mt-1">{dateRange}</p>

        {/* Reason */}
        <p className="text-[12px] text-[#6B7280] mt-1 truncate">{reason}</p>

        {/* Extra info (correction timings) */}
        {extraInfo && (
          <p className="text-[11px] text-[#9CA3AF] mt-1">{extraInfo}</p>
        )}

        {/* Submitted on */}
        <p className="text-[11px] text-[#9CA3AF] mt-2">Submitted {submittedOn}</p>
      </div>
    </div>
  )
}
