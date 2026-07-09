import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReportRow, ReportType } from '@/lib/mock/reports'

export function exportReportToPDF(type: ReportType, rows: ReportRow[], label: string): void {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.text('AttendEase', 14, 20)
  
  doc.setFontSize(12)
  doc.text(label, 14, 30)

  let head: string[][] = []
  let body: any[][] = []

  switch (type) {
    case 'daily':
    case 'employee':
      head = [['Employee', 'Check In', 'Check Out', 'Hours', 'Status']]
      body = rows.map(r => [
        r.employeeName || '—',
        r.checkIn || '—',
        r.checkOut || '—',
        r.workingHours?.toString() || '—',
        r.status || '—'
      ])
      break
    case 'monthly':
      head = [['Employee', 'Days Present', 'Total Hours', 'Status']]
      body = rows.map(r => [
        r.employeeName || '—',
        r.days ? `${r.days} days` : '—',
        r.workingHours?.toString() || '—',
        r.status || '—'
      ])
      break
    case 'leave':
      head = [['Employee', 'Leave Type', 'Date Range', 'Days', 'Status']]
      body = rows.map(r => [
        r.employeeName || '—',
        r.leaveType || '—',
        r.date || '—',
        r.days ? `${r.days}d` : '—',
        r.status || '—'
      ])
      break
    case 'wfh':
      head = [['Employee', 'Date', 'Date Range', 'Days', 'Reason', 'Status']]
      body = rows.map(r => [
        r.employeeName || '—',
        r.date || '—',
        r.date || '—', // In LeaveWFHTable, both 'Date' and 'Date Range' map to r.date for WFH
        r.days ? `${r.days}d` : '—',
        r.reason || '—',
        r.status || '—'
      ])
      break
    case 'late':
      head = [['Employee', 'Date', 'Check In', 'Reason']]
      body = rows.map(r => [
        r.employeeName || '—',
        r.date || '—',
        r.checkIn || '—',
        r.reason || '—'
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
