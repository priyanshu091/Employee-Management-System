'use client'

import { useState, useEffect } from 'react'
import Avatar from '@/components/shared/Avatar'
import type { AuditLogWithProfiles } from '@/types'

const PAGE_SIZE = 10

interface AuditTableProps {
  entries: AuditLogWithProfiles[]
}

function ChangeBadge({ type }: { type: string }) {
  return (
    <span className="inline-block text-[10px] font-medium bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-full whitespace-nowrap">
      {type}
    </span>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function formatValue(value: Record<string, unknown>): string {
  const parts = Object.entries(value).map(([k, v]) => {
    if (v == null) return `${k}: —`
    if (typeof v === 'string' && v.includes('T')) {
      const d = new Date(v)
      if (!isNaN(d.getTime())) {
        return `${k}: ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
      }
    }
    return `${k}: ${String(v)}`
  })
  return parts.join(', ')
}

export default function AuditTable({ entries }: AuditTableProps) {
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever the filtered entry set changes, so a filter
  // narrowing results can't strand the user on a now-empty page.
  useEffect(() => {
    setPage(1)
  }, [entries])

  const totalPages = Math.ceil(entries.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const pageRows = entries.slice(start, start + PAGE_SIZE)

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl py-16 text-center">
        <p className="text-[14px] font-medium text-[#374151]">No audit records found</p>
        <p className="text-[13px] text-[#6B7280] mt-1">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              {['Date & Time', 'Employee', 'Changed By', 'Change', 'Previous', 'Updated', 'Reason'].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((entry) => (
              <tr key={entry.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors duration-150">
                {/* Date & Time */}
                <td className="px-4 py-3 text-[12px] text-[#6B7280] whitespace-nowrap">{formatDateTime(entry.created_at)}</td>

                {/* Employee affected */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={entry.affected?.full_name ?? '—'} size="sm" />
                    <div>
                      <p className="text-[12px] font-medium text-[#111827]">{entry.affected?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-mono">{entry.affected?.employee_id ?? '—'}</p>
                    </div>
                  </div>
                </td>

                {/* Changed by */}
                <td className="px-4 py-3">
                  <p className="text-[12px] text-[#6B7280] whitespace-nowrap">{entry.changer?.full_name ?? 'Unknown'}</p>
                  <p className="text-[10px] text-[#9CA3AF]">Admin</p>
                </td>

                {/* Change type badge */}
                <td className="px-4 py-3">
                  <ChangeBadge type={entry.target_type} />
                </td>

                {/* Previous value */}
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[#DC2626] font-medium">{formatValue(entry.previous_value)}</span>
                </td>

                {/* New value */}
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[#16A34A] font-medium">{formatValue(entry.new_value)}</span>
                </td>

                {/* Reason */}
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="text-[12px] text-[#6B7280] truncate" title={entry.reason}>
                    {entry.reason}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#F3F4F6]">
        <p className="text-[12px] text-[#6B7280]">
          Showing {start + 1}–{Math.min(start + PAGE_SIZE, entries.length)} of {entries.length} entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[12px] text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
