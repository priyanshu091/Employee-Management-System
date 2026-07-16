import Avatar from '@/components/shared/Avatar'

interface InOfficeRow {
  employee_id: string
  check_in: string
  profiles: { full_name: string; department: string | null } | null
}

interface WhoIsInOfficeProps {
  rows: InOfficeRow[]
  loading?: boolean
}

function formatSince(iso: string): string {
  return `Since ${new Date(iso).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}`
}

export default function WhoIsInOffice({ rows, loading }: WhoIsInOfficeProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
        <div className="h-4 w-28 bg-[#F3F4F6] animate-pulse rounded-md mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-[#F3F4F6] animate-pulse rounded-md mb-2" />
        ))}
      </div>
    )
  }

  const visible = rows.slice(0, 5)
  const overflow = rows.length - visible.length

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-medium text-[#111827]">In office now</h2>
        <span className="bg-[#F0FDF4] text-[#16A34A] text-[11px] px-2.5 py-1 rounded-full font-medium">
          {rows.length} in
        </span>
      </div>

      {/* Employee rows */}
      {rows.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-[#6B7280]">No one checked in yet</p>
        </div>
      ) : (
        <div>
          {visible.map((row) => (
            <div
              key={row.employee_id}
              className="flex items-center gap-2.5 py-2.5 border-b border-[#F3F4F6] last:border-0"
            >
              <Avatar name={row.profiles?.full_name ?? '—'} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#111827] truncate">{row.profiles?.full_name ?? 'Unknown'}</p>
                <p className="text-[10px] text-[#6B7280]">{row.profiles?.department ?? '—'}</p>
              </div>
              <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{formatSince(row.check_in)}</span>
            </div>
          ))}

          {overflow > 0 && (
            <p className="text-[11px] text-[#9CA3AF] text-center pt-3">
              And {overflow} more in office
            </p>
          )}
        </div>
      )}
    </div>
  )
}
