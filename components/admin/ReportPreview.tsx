'use client'

import { BarChart2, FileText, Table } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import { useToast } from '@/components/shared/Toast'
import { type ReportType } from '@/lib/mock/reports'
import { exportReportToPDF } from '@/lib/export/pdf'
import { exportReportToExcel } from '@/lib/export/excel'
import type { ReportRow, DailyReportRow, MonthlyReportRow, LeaveReportRow, WFHReportRow, LateReportRow } from '@/types'

interface ReportPreviewProps {
  type: ReportType | null
  rows: ReportRow[]
  label: string
  generated: boolean
}

// ── Daily / Employee table ────────────────────────────────────────────────────
function DailyTable({ rows }: { rows: DailyReportRow[] }) {
  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employee_name} size="sm" />
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{r.employee_name}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{r.employee_id}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.date}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.check_in || '--'}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.check_out || '--'}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.working_hours || '--'}</td>
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">Total: {rows.length} records</td>
          <td colSpan={5} />
        </tr>
      </tbody>
    </table>
  )
}

// ── Monthly table ─────────────────────────────────────────────────────────────
function MonthlyTable({ rows }: { rows: MonthlyReportRow[] }) {
  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Dept', 'Present', 'Late', 'WFH', 'Leave', 'Total Hours'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employee_name} size="sm" />
                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{r.employee_name}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono">{r.employee_id}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.department}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.present_days}</td>
            <td className="px-4 py-3 text-[13px] text-[#D97706] font-medium">{r.late_days}</td>
            <td className="px-4 py-3 text-[13px] text-[#2563EB] font-medium">{r.wfh_days}</td>
            <td className="px-4 py-3 text-[13px] text-[#7C3AED] font-medium">{r.leave_days}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.total_working_hours}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} employees</td>
          <td colSpan={6} />
        </tr>
      </tbody>
    </table>
  )
}

// ── Leave table ───────────────────────────────────────────────────────────────
function LeaveTable({ rows }: { rows: LeaveReportRow[] }) {
  return (
    <table className="w-full min-w-[580px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Leave Type', 'Start', 'End', 'Days', 'Status'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employee_name} size="sm" />
                <p className="text-[13px] font-medium text-[#111827]">{r.employee_name}</p>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.leave_type}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.start_date}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.end_date}</td>
            <td className="px-4 py-3 text-[13px] font-medium text-[#111827]">{r.days}d</td>
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} requests</td>
          <td colSpan={5} />
        </tr>
      </tbody>
    </table>
  )
}

// ── WFH table ─────────────────────────────────────────────────────────────────
function WFHTable({ rows }: { rows: WFHReportRow[] }) {
  return (
    <table className="w-full min-w-[500px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Date', 'Reason', 'Status'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employee_name} size="sm" />
                <p className="text-[13px] font-medium text-[#111827]">{r.employee_name}</p>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.date}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280] max-w-[200px] truncate">{r.reason}</td>
            <td className="px-4 py-3">{r.status && <StatusBadge variant={r.status} />}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} requests</td>
          <td colSpan={3} />
        </tr>
      </tbody>
    </table>
  )
}

// ── Late table ────────────────────────────────────────────────────────────────
function LateTable({ rows }: { rows: LateReportRow[] }) {
  return (
    <table className="w-full min-w-[560px]">
      <thead>
        <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          {['Employee', 'Dept', 'Date', 'Check In', 'Reason'].map((col) => (
            <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Avatar name={r.employee_name} size="sm" />
                <p className="text-[13px] font-medium text-[#111827]">{r.employee_name}</p>
              </div>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.department}</td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.date}</td>
            <td className="px-4 py-3">
              <span className="text-[12px] font-medium text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded-full">
                {r.check_in}
              </span>
            </td>
            <td className="px-4 py-3 text-[13px] text-[#6B7280]">{r.late_reason || '--'}</td>
          </tr>
        ))}
        <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <td className="px-4 py-3 text-[12px] font-semibold text-[#111827]">{rows.length} late instances</td>
          <td colSpan={4} />
        </tr>
      </tbody>
    </table>
  )
}

export default function ReportPreview({ type, rows, label, generated }: ReportPreviewProps) {
  const { showToast } = useToast()

  const handleExport = async (format: 'PDF' | 'Excel') => {
    try {
      if (format === 'PDF') {
        await exportReportToPDF(type!, rows, label)
      } else {
        await exportReportToExcel(type!, rows, label)
      }

      fetch('/api/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format, label }),
      }).catch(console.error)

      showToast(`${format} exported successfully.`, 'success')
    } catch (error) {
      console.error(error)
      showToast(`Failed to export ${format}.`, 'error')
    }
  }

  if (!generated || !type) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-24">
        <BarChart2 size={40} className="text-[#D1D5DB]" strokeWidth={1.5} />
        <p className="text-[13px] text-[#6B7280] mt-3">Select a report type and click Generate</p>
      </div>
    )
  }

  if (generated && rows.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-24">
        <BarChart2 size={40} className="text-[#D1D5DB]" strokeWidth={1.5} />
        <p className="text-[13px] text-[#6B7280] mt-3">No records found for the selected filters.</p>
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
        {(type === 'daily' || type === 'employee') && <DailyTable rows={rows as DailyReportRow[]} />}
        {type === 'monthly' && <MonthlyTable rows={rows as MonthlyReportRow[]} />}
        {type === 'leave' && <LeaveTable rows={rows as LeaveReportRow[]} />}
        {type === 'wfh' && <WFHTable rows={rows as WFHReportRow[]} />}
        {type === 'late' && <LateTable rows={rows as LateReportRow[]} />}
      </div>
    </div>
  )
}
