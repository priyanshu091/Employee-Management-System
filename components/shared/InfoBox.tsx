import { Info } from 'lucide-react'

interface InfoBoxProps {
  message: string
}

export default function InfoBox({ message }: InfoBoxProps) {
  return (
    <div className="flex items-start gap-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 mt-1">
      <Info size={14} className="text-[#2563EB] flex-shrink-0 mt-0.5" strokeWidth={2} />
      <p className="text-[12px] text-[#1D4ED8] leading-relaxed">{message}</p>
    </div>
  )
}
