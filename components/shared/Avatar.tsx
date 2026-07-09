import { cn } from '@/lib/utils/cn'

const BG_COLORS = [
  'bg-[#EEF2FF] text-[#4F46E5]',
  'bg-[#F0FDF4] text-[#16A34A]',
  'bg-[#FEF3C7] text-[#D97706]',
  'bg-[#FDF2F8] text-[#9D174D]',
  'bg-[#EFF6FF] text-[#1D4ED8]',
]

function getColorIndex(name: string): number {
  return name.charCodeAt(0) % BG_COLORS.length
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[13px]',
}

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium flex-shrink-0',
        BG_COLORS[getColorIndex(name)],
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
