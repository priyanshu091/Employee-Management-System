'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { AlertTriangle } from 'lucide-react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import AuditTable from '@/components/admin/AuditTable'
import { INPUT_CLASS } from '@/components/shared/FormField'
import { getAuditLog, getAllEmployees } from '@/lib/api/admin'
import type { AuditLogWithProfiles, Profile } from '@/types'

export default function AdminAuditPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [employee, setEmployee] = useState('all')
  const { data: employeesData } = useSWR('allEmployees', getAllEmployees)
  const employees = employeesData || []

  const [applied, setApplied] = useState({ dateFrom: '', dateTo: '', employee: 'all' })

  const { data: entriesData, isLoading: loading } = useSWR(
    ['auditLog', applied.employee, applied.dateFrom, applied.dateTo],
    ([_, e, f, t]) => getAuditLog({ employee: e === 'all' ? undefined : (e as string), from: f as string || undefined, to: t as string || undefined })
  )
  const entries = entriesData || []

  const handleFilter = () => {
    setApplied({ dateFrom, dateTo, employee })
  }

  const handleClear = () => {
    setDateFrom(''); setDateTo(''); setEmployee('all')
    setApplied({ dateFrom: '', dateTo: '', employee: 'all' })
  }

  const SELECT_CLASS = `border border-[#E5E7EB] rounded-md px-3 py-2 text-[13px] text-[#111827] bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none transition-colors duration-150`

  return (
    <>
      <AdminTopbar title="Audit Log" />

      <main className="flex-1 p-5">
        {/* Immutability warning banner */}
        <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={16} className="text-[#D97706] flex-shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[13px] text-[#92400E] leading-relaxed">
            Audit records are permanent. Once created, they cannot be modified or deleted by anyone, including admins.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1 uppercase tracking-wide">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1 uppercase tracking-wide">To date</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1 uppercase tracking-wide">Employee</label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="all">All employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFilter}
            className="border border-[#4F46E5] text-[#4F46E5] hover:bg-[#EEF2FF] px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
          >
            Apply filter
          </button>
          {(applied.dateFrom || applied.dateTo || applied.employee !== 'all') && (
            <button
              onClick={handleClear}
              className="text-[12px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-[12px] text-[#9CA3AF]">{entries.length} records</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-[#F3F4F6] last:border-0 bg-[#F3F4F6] animate-pulse" />
            ))}
          </div>
        ) : (
          <AuditTable entries={entries} />
        )}
      </main>
    </>
  )
}
