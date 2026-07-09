interface StatCardProps {
  label: string
  value: number
  dotColor: string
}

export default function StatCard({ label, value, dotColor }: StatCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
      <div
        className="w-1.5 h-1.5 rounded-full mb-3"
        style={{ background: dotColor }}
        aria-hidden="true"
      />
      <p className="text-[22px] font-semibold text-[#111827] leading-none">{value}</p>
      <p className="text-[11px] text-[#6B7280] mt-1.5 leading-tight">{label}</p>
    </div>
  )
}
