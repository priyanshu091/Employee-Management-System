import type { ReportType } from '@/lib/mock/reports'
import type { ReportRow, DailyReportRow, MonthlyReportRow, LeaveReportRow, WFHReportRow, LateReportRow } from '@/types'

export async function exportReportToPDF(type: ReportType, rows: ReportRow[], label: string): Promise<void> {
  const jsPDF = (await import('jspdf')).default
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.text('Feelify EMS', 14, 20)
  
  doc.setFontSize(12)
  doc.text(label, 14, 30)

  let head: string[][] = []
  let body: string[][] = []

  switch (type) {
    case 'daily':
    case 'employee':
      head = [['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status']]
      body = (rows as DailyReportRow[]).map(r => [
        r.employee_name || '—',
        r.date || '—',
        r.check_in || '—',
        r.check_out || '—',
        r.working_hours?.toString() || '—',
        r.status || '—'
      ])
      break
    case 'monthly':
      head = [['Employee', 'Present', 'Late', 'WFH', 'Leave', 'Total Hours']]
      body = (rows as MonthlyReportRow[]).map(r => [
        r.employee_name || '—',
        r.present_days?.toString() || '0',
        r.late_days?.toString() || '0',
        r.wfh_days?.toString() || '0',
        r.leave_days?.toString() || '0',
        r.total_working_hours?.toString() || '—'
      ])
      break
    case 'leave':
      head = [['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status']]
      body = (rows as LeaveReportRow[]).map(r => [
        r.employee_name || '—',
        r.leave_type || '—',
        r.start_date || '—',
        r.end_date || '—',
        r.days ? `${r.days}d` : '—',
        r.status || '—'
      ])
      break
    case 'wfh':
      head = [['Employee', 'Date', 'Reason', 'Status']]
      body = (rows as WFHReportRow[]).map(r => [
        r.employee_name || '—',
        r.date || '—',
        r.reason || '—',
        r.status || '—'
      ])
      break
    case 'late':
      head = [['Employee', 'Department', 'Date', 'Check In', 'Reason']]
      body = (rows as LateReportRow[]).map(r => [
        r.employee_name || '—',
        r.department || '—',
        r.date || '—',
        r.check_in || '—',
        r.late_reason || '—'
      ])
      break
  }

  autoTable(doc, {
    startY: 35,
    head,
    body,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] }, // #4F46E5
  })

  doc.save(`${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`)
}
