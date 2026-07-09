import { cn } from '@/lib/utils/cn'
import type { AttendanceStatus, RequestStatus } from '@/types'

type BadgeVariant = AttendanceStatus | RequestStatus

const variantStyles: Record<BadgeVariant, string> = {
  present:  'bg-[#F0FDF4] text-[#16A34A]',
  late:     'bg-[#FFFBEB] text-[#D97706]',
  absent:   'bg-[#FEF2F2] text-[#DC2626]',
  wfh:      'bg-[#EFF6FF] text-[#2563EB]',
  leave:    'bg-[#F5F3FF] text-[#7C3AED]',
  pending:  'bg-[#FFFBEB] text-[#D97706]',
  approved: 'bg-[#F0FDF4] text-[#16A34A]',
  rejected: 'bg-[#FEF2F2] text-[#DC2626]',
}

const variantLabels: Record<BadgeVariant, string> = {
  present:  'Present',
  late:     'Late',
  absent:   'Absent',
  wfh:      'WFH',
  leave:    'Leave',
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface StatusBadgeProps {
  variant: BadgeVariant
  className?: string
}

export default function StatusBadge({ variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium',
        variantStyles[variant],
        className
      )}
    >
      {variantLabels[variant]}
    </span>
  )
}
