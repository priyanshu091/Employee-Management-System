import type { ReportType } from '@/lib/mock/reports'
import type { AttendanceWithProfile } from '@/types'

export async function exportReportToExcel(type: ReportType | 'attendance', rows: any[], label: string): Promise<void> {
  const XLSX = await import('xlsx')
  let data: any[] = []

  const getP = (p: any) => Array.isArray(p) ? p[0] : p

  if (type === 'attendance') {
    data = (rows as AttendanceWithProfile[]).map(r => {
      const p = getP(r.profile)
      return {
        'Employee Name': p?.full_name || 'Unknown',
        'Employee ID': p?.employee_id || '—',
        'Date': r.date,
        'Type': r.type,
        'Check In': r.check_in ? new Date(r.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
        'Check Out': r.check_out ? new Date(r.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
        'Working Hours': r.working_hours !== null ? r.working_hours.toFixed(2) : '—',
        'Status': r.status,
        'Late Reason': r.late_reason || '—'
      }
    })
  } else {
    switch (type) {
      case 'daily':
      case 'employee':
        data = rows.map(r => ({
          'Employee Name': r.employee_name || '—',
          'Employee ID': r.employee_id || '—',
          'Department': r.department || '—',
          'Date': r.date || '—',
          'Check In': r.check_in || '—',
          'Check Out': r.check_out || '—',
          'Working Hours': r.working_hours || '—',
          'Status': r.status || '—'
        }))
        break
      case 'monthly':
        data = rows.map(r => ({
          'Employee Name': r.employee_name || '—',
          'Employee ID': r.employee_id || '—',
          'Department': r.department || '—',
          'Present Days': r.present_days ?? 0,
          'Late Days': r.late_days ?? 0,
          'WFH Days': r.wfh_days ?? 0,
          'Leave Days': r.leave_days ?? 0,
          'Total Hours': r.total_working_hours || '—'
        }))
        break
      case 'leave':
        data = rows.map(r => ({
          'Employee Name': r.employee_name || '—',
          'Employee ID': r.employee_id || '—',
          'Leave Type': r.leave_type || '—',
          'Start Date': r.start_date || '—',
          'End Date': r.end_date || '—',
          'Days': r.days ?? 0,
          'Status': r.status || '—'
        }))
        break
      case 'wfh':
        data = rows.map(r => ({
          'Employee Name': r.employee_name || '—',
          'Employee ID': r.employee_id || '—',
          'Date': r.date || '—',
          'Reason': r.reason || '—',
          'Status': r.status || '—'
        }))
        break
      case 'late':
        data = rows.map(r => ({
          'Employee Name': r.employee_name || '—',
          'Employee ID': r.employee_id || '—',
          'Department': r.department || '—',
          'Date': r.date || '—',
          'Check In': r.check_in || '—',
          'Reason': r.late_reason || '—'
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
