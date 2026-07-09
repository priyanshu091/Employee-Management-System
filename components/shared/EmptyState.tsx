import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  sub: string
  ctaLabel?: string
  onCta?: () => void
}

export default function EmptyState({ icon: Icon, heading, sub, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <Icon size={40} className="text-[#D1D5DB]" strokeWidth={1.5} />
      <h3 className="text-[14px] font-medium text-[#374151] mt-3">{heading}</h3>
      <p className="text-[13px] text-[#6B7280] mt-1">{sub}</p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-4 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg px-4 py-2 text-[13px] transition-colors duration-150"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
