import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface QuickActionCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  sublabel: string
  href?: string
  onClick?: () => void
}

export default function QuickActionCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  href,
  onClick,
}: QuickActionCardProps) {
  const inner = (
    <div className="flex items-center gap-3 p-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[#111827]">{label}</p>
        <p className="text-[11px] text-[#6B7280] mt-0.5">{sublabel}</p>
      </div>
    </div>
  )

  const baseClass =
    'bg-white border border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#4F46E5] hover:bg-[#FAFAFE] transition-colors duration-150 block'

  if (href) {
    return <Link href={href} className={baseClass}>{inner}</Link>
  }

  return (
    <button onClick={onClick} className={`${baseClass} w-full text-left`}>
      {inner}
    </button>
  )
}
