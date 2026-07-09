import { LucideIcon } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import type { RequestStatus } from '@/types'

interface RequestCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  type: string
  dateRange: string
  reason: string
  submittedOn: string
  status: RequestStatus
}

export default function RequestCard({
  icon: Icon,
  iconBg,
  iconColor,
  type,
  dateRange,
  reason,
  status,
}: RequestCardProps) {
  const parts = reason.split('. Admin rejection reason: ')
  const original = parts[0]
  const rejection = parts.length > 1 ? parts[1] : null

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F6] last:border-0">
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={15} style={{ color: iconColor }} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-[#111827]">{type}</span>
          <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{dateRange}</span>
        </div>
        <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
          {original}
          {rejection && (
            <span className="ml-1.5 font-medium text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded text-[10px]">
              Admin note: {rejection}
            </span>
          )}
        </p>
      </div>

      {/* Status */}
      <StatusBadge variant={status} className="flex-shrink-0" />
    </div>
  )
}
