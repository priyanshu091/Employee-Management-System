import { Trash2 } from 'lucide-react'
import type { Holiday } from '@/types'

interface HolidayCardProps {
  holiday: Holiday
  onDelete: (id: string) => void
}

export default function HolidayCard({ holiday, onDelete }: HolidayCardProps) {
  const d = new Date(holiday.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = d >= today
  const dayNum = String(d.getDate())
  const month = d.toLocaleDateString('en-IN', { month: 'short' })
  const day = d.toLocaleDateString('en-IN', { weekday: 'long' })

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 flex items-center gap-4">
      {/* Date block */}
      <div className="bg-[#EEF2FF] rounded-xl p-3 text-center min-w-[52px] flex-shrink-0">
        <p className="text-[20px] font-semibold text-[#4F46E5] leading-none">{dayNum}</p>
        <p className="text-[11px] text-[#4F46E5] mt-0.5">{month}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-medium text-[#111827]">{holiday.name}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            upcoming
              ? 'bg-[#EEF2FF] text-[#4F46E5]'
              : 'bg-[#F3F4F6] text-[#9CA3AF]'
          }`}>
            {upcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
        <p className="text-[12px] text-[#6B7280] mt-0.5">{day}</p>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(holiday.id)}
        className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors duration-150 p-1.5 rounded-md hover:bg-[#FEF2F2] flex-shrink-0"
        aria-label={`Delete ${holiday.name}`}
      >
        <Trash2 size={15} strokeWidth={1.75} />
      </button>
    </div>
  )
}
