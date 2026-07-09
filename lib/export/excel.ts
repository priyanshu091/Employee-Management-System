import * as XLSX from 'xlsx'
import type { ReportRow, ReportType } from '@/lib/mock/reports'
import type { AttendanceWithProfile } from '@/types'

export function exportReportToExcel(type: ReportType | 'attendance', rows: any[], label: string): void {
  let data: any[] = []

  if (type === 'attendance') {
    data = (rows as AttendanceWithProfile[]).map(r => ({
      'Employee Name': r.profile?.full_name || 'Unknown',
      'Employee ID': r.profile?.employee_id || '—',
      'Date': r.date,
      'Type': r.type,
      'Check In': r.check_in ? new Date(r.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
      'Check Out': r.check_out ? new Date(r.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
      'Working Hours': r.working_hours !== null ? r.working_hours.toFixed(2) : '—',
      'Status': r.status,
      'Late Reason': r.late_reason || '—'
    }))
  } else {
    // ReportRow types
    const reportRows = rows as ReportRow[]
    switch (type) {
      case 'daily':
      case 'employee':
        data = reportRows.map(r => ({
          'Employee Name': r.employeeName,
          'Employee ID': r.employeeId,
          'Check In': r.checkIn || '—',
          'Check Out': r.checkOut || '—',
          'Working Hours': r.workingHours || '—',
          'Status': r.status || '—'
        }))
        break
      case 'monthly':
        data = reportRows.map(r => ({
          'Employee Name': r.employeeName,
          'Employee ID': r.employeeId,
          'Days Present': r.days || 0,
          'Total Hours': r.workingHours || '—',
          'Status': r.status || '—'
        }))
        break
      case 'leave':
        data = reportRows.map(r => ({
          'Employee Name': r.employeeName,
          'Employee ID': r.employeeId,
          'Leave Type': r.leaveType || '—',
          'Date Range': r.date || '—',
          'Days': r.days || 0,
          'Status': r.status || '—'
        }))
        break
      case 'wfh':
        data = reportRows.map(r => ({
          'Employee Name': r.employeeName,
          'Employee ID': r.employeeId,
          'Date': r.date || '—',
          'Days': r.days || 0,
          'Reason': r.reason || '—',
          'Status': r.status || '—'
        }))
        break
      case 'late':
        data = reportRows.map(r => ({
          'Employee Name': r.employeeName,
          'Employee ID': r.employeeId,
          'Date': r.date || '—',
          'Check In': r.checkIn || '—',
          'Reason': r.reason || '—'
        }))
        break
    }
  }

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  const filename = `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`
  XLSX.writeFile(wb, filename)
}
