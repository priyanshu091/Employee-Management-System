import { cn } from '@/lib/utils/cn'

interface SkeletonRowProps {
  cols?: number
  className?: string
}

function SkeletonCell({ width = 'w-full' }: { width?: string }) {
  return (
    <div className={cn('h-4 bg-[#F3F4F6] rounded animate-pulse', width)} />
  )
}

export default function SkeletonRow({ cols = 6, className }: SkeletonRowProps) {
  const widths = ['w-24', 'w-16', 'w-20', 'w-20', 'w-16', 'w-20']
  return (
    <tr className={cn('border-b border-[#F3F4F6]', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonCell width={widths[i] ?? 'w-full'} />
        </td>
      ))}
    </tr>
  )
}
