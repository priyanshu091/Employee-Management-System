import { cn } from '@/lib/utils/cn'
import { REPORT_OPTIONS, type ReportType } from '@/lib/mock/reports'

interface ReportTypeSelectorProps {
  selected: ReportType | null
  onChange: (type: ReportType) => void
}

export default function ReportTypeSelector({ selected, onChange }: ReportTypeSelectorProps) {
  return (
    <div>
      <p className="text-[12px] font-medium text-[#374151] mb-2">Report type</p>
      <div className="flex flex-col gap-1.5">
        {REPORT_OPTIONS.map((opt) => {
          const isActive = selected === opt.type
          return (
            <button
              key={opt.type}
              onClick={() => onChange(opt.type)}
              className={cn(
                'border rounded-xl px-4 py-3 text-left transition-colors duration-150 w-full',
                isActive
                  ? 'border-[#4F46E5] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151]'
              )}
            >
              <p className={cn(
                'text-[13px] font-medium',
                isActive ? 'text-[#4F46E5]' : 'text-[#111827]'
              )}>
                {opt.label}
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{opt.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
