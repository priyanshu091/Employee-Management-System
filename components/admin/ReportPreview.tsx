'use client'

import { BarChart2, FileText, Table } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import { useToast } from '@/components/shared/Toast'
import { type ReportRow, type ReportType } from '@/lib/mock/reports'

interface ReportPreviewProps {
  type: ReportType | null
  rows: ReportRow[]
  label: string          // e.g. "Daily Attendance — 8 Jul 2026"
  generated: boolean
}

function DailyTable({ rows }: { rows: ReportRow[] }) {
  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Check In', 'Check Out', 'Hours', 'Status'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.employeeId} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employeeName} size="sm" />
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{r.employeeName}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{r.employeeId}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.checkIn || '—'}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.checkOut || '—'}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.workingHours || '—'}</td>
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        {/* Summary row */}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">Total: {rows.length} employees</td>
          <td colSpan={2} />
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">
            {rows.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'wfh').length} present
          </td>
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">
            {rows.filter(r => r.status === 'absent').length} absent
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function MonthlyTable({ rows }: { rows: ReportRow[] }) {
  return (
    <table className="w-full min-w-[500px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Days Present', 'Total Hours', 'Status'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.employeeId} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employeeName} size="sm" />
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{r.employeeName}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{r.employeeId}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.days} days</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.workingHours}</td>
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} employees</td>
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">
            Avg {Math.round(rows.reduce((a, r) => a + (r.days ?? 0), 0) / rows.length)} days
          </td>
          <td colSpan={2} />
        </tr>
      </tbody>
    </table>
  )
}

function LeaveWFHTable({ rows, isWFH }: { rows: ReportRow[]; isWFH?: boolean }) {
  const columns = [
    'Employee',
    isWFH ? 'Date' : 'Leave Type',
    'Date Range',
    'Days',
    isWFH ? 'Reason' : '',
    'Status',
  ].filter(Boolean)

  return (
    <table className="w-full min-w-[580px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employeeName} size="sm" />
                <p className="text-[13px] font-medium text-[#111827]">{r.employeeName}</p>
              </div>
            </td>
            {!isWFH && <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.leaveType}</td>}
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.date}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.days}d</td>
            {isWFH && <td className="px-4 py-3 text-[13px] text-[#6B7280] max-w-[150px] truncate">{r.reason}</td>}
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} requests</td>
          <td colSpan={10} />
        </tr>
      </tbody>
    </table>
  )
}

function LateTable({ rows }: { rows: ReportRow[] }) {
  return (
    <table className="w-full min-w-[560px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Date', 'Check In', 'Reason'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employeeName} size="sm" />
                <p className="text-[13px] font-medium text-[#111827]">{r.employeeName}</p>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.date}</td>
            <td className="px-4 py-3">
              <span className="text-[12px] font-medium text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full">{r.checkIn}</span>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.reason || '—'}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} late instances</td>
          <td colSpan={3} />
        </tr>
      </tbody>
    </table>
  )
}

export default function ReportPreview({ type, rows, label, generated }: ReportPreviewProps) {
  const { showToast } = useToast()

  const handleExport = (format: 'PDF' | 'Excel') => {
    showToast(`${format} export available after Supabase integration.`, 'success')
  }

  if (!generated || !type) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-24">
        <BarChart2 size={40} className="text-[#D1D5DB]" strokeWidth={1.5} />
        <p className="text-[13px] text-[#6B7280] mt-3">Select a report type and click Generate</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#111827]">{label}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] px-3 py-1.5 rounded-lg text-[12px] transition-colors duration-150"
          >
            <FileText size={13} strokeWidth={1.75} />
            PDF
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="flex items-center gap-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] px-3 py-1.5 rounded-lg text-[12px] transition-colors duration-150"
          >
            <Table size={13} strokeWidth={1.75} />
            Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {(type === 'daily' || type === 'employee') && <DailyTable rows={rows} />}
        {type === 'monthly' && <MonthlyTable rows={rows} />}
        {type === 'leave' && <LeaveWFHTable rows={rows} />}
        {type === 'wfh' && <LeaveWFHTable rows={rows} isWFH />}
        {type === 'late' && <LateTable rows={rows} />}
      </div>
    </div>
  )
}
