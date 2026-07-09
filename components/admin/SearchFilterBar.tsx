'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const SELECT_CLASS = `
  border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#111827] bg-white
  focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none
  transition-colors duration-150 cursor-pointer
`

interface SelectOption {
  value: string
  label: string
}

interface FilterSelect {
  value: string
  onChange: (val: string) => void
  options: SelectOption[]
  ariaLabel: string
}

interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (val: string) => void
  searchPlaceholder?: string
  selects?: FilterSelect[]
  rightSlot?: React.ReactNode
  className?: string
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  selects = [],
  rightSlot,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn(
      'bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap',
      className
    )}>
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full border border-[#E5E7EB] rounded-md pl-9 pr-3 py-2 text-[13px] text-[#111827] placeholder:text-[#9CA3AF] bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors duration-150"
        />
      </div>

      {/* Selects */}
      {selects.map((s, i) => (
        <select
          key={i}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          aria-label={s.ariaLabel}
          className={SELECT_CLASS}
        >
          {s.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {/* Right slot (e.g. Export button) */}
      {rightSlot}
    </div>
  )
}
