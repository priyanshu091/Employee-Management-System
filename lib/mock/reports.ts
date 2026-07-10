import type { AttendanceStatus, RequestStatus } from '@/types'

// ── Report preview rows ──────────────────────────────────────────────────────
// Used to render mock table after "Generate" is clicked

export interface ReportRow {
  employeeId: string
  employeeName: string
  date?: string
  checkIn?: string
  checkOut?: string
  workingHours?: string
  status?: AttendanceStatus | RequestStatus
  type?: string
  days?: number          // for leave/wfh reports
  leaveType?: string
  reason?: string
}

// Daily attendance (8 Jul 2026)
export const DAILY_REPORT_ROWS: ReportRow[] = [
  { employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  date: '8 Jul 2026', checkIn: '10:04 AM', checkOut: '07:12 PM', workingHours: '9h 08m', status: 'present' },
  { employeeId: 'EMP-002', employeeName: 'Sneha Verma',  date: '8 Jul 2026', checkIn: '09:58 AM', checkOut: '07:00 PM', workingHours: '9h 02m', status: 'present' },
  { employeeId: 'EMP-003', employeeName: 'Mohit Jain',   date: '8 Jul 2026', checkIn: '10:22 AM', checkOut: '07:30 PM', workingHours: '9h 08m', status: 'late'    },
  { employeeId: 'EMP-004', employeeName: 'Priya Sharma', date: '8 Jul 2026', checkIn: '09:45 AM', checkOut: '06:50 PM', workingHours: '9h 05m', status: 'present' },
  { employeeId: 'EMP-005', employeeName: 'Amit Khanna',  date: '8 Jul 2026', checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'wfh'     },
  { employeeId: 'EMP-006', employeeName: 'Divya Nair',   date: '8 Jul 2026', checkIn: '',         checkOut: '',         workingHours: '—',      status: 'absent'  },
  { employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  date: '8 Jul 2026', checkIn: '10:35 AM', checkOut: '07:40 PM', workingHours: '9h 05m', status: 'late'    },
  { employeeId: 'EMP-008', employeeName: 'Kavya Pillai', date: '8 Jul 2026', checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'present' },
]

// Monthly summary (July 2026)
export const MONTHLY_REPORT_ROWS: ReportRow[] = [
  { employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  status: 'present', workingHours: '198h 20m', days: 22 },
  { employeeId: 'EMP-002', employeeName: 'Sneha Verma',  status: 'present', workingHours: '195h 00m', days: 21 },
  { employeeId: 'EMP-003', employeeName: 'Mohit Jain',   status: 'late',    workingHours: '185h 10m', days: 20 },
  { employeeId: 'EMP-004', employeeName: 'Priya Sharma', status: 'present', workingHours: '200h 05m', days: 22 },
  { employeeId: 'EMP-005', employeeName: 'Amit Khanna',  status: 'wfh',     workingHours: '190h 00m', days: 21 },
  { employeeId: 'EMP-006', employeeName: 'Divya Nair',   status: 'absent',  workingHours: '162h 00m', days: 18 },
  { employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  status: 'late',    workingHours: '178h 30m', days: 19 },
  { employeeId: 'EMP-008', employeeName: 'Kavya Pillai', status: 'present', workingHours: '198h 00m', days: 22 },
]

// Leave report
export const LEAVE_REPORT_ROWS: ReportRow[] = [
  { employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  leaveType: 'Casual Leave',    date: '17–18 Jul', days: 2, status: 'approved' },
  { employeeId: 'EMP-002', employeeName: 'Sneha Verma',  leaveType: 'Sick Leave',      date: '20 Jun',    days: 1, status: 'approved' },
  { employeeId: 'EMP-003', employeeName: 'Mohit Jain',   leaveType: 'Earned Leave',    date: '25–27 May', days: 3, status: 'approved' },
  { employeeId: 'EMP-004', employeeName: 'Priya Sharma', leaveType: 'Casual Leave',    date: '10 Apr',    days: 1, status: 'rejected' },
  { employeeId: 'EMP-005', employeeName: 'Amit Khanna',  leaveType: 'Emergency Leave', date: '5–6 Mar',   days: 2, status: 'approved' },
]

// WFH report
export const WFH_REPORT_ROWS: ReportRow[] = [
  { employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  date: '25 Jul', days: 1, status: 'approved', reason: 'Internet repair' },
  { employeeId: 'EMP-002', employeeName: 'Sneha Verma',  date: '14 Jul', days: 1, status: 'approved', reason: 'Child unwell'    },
  { employeeId: 'EMP-004', employeeName: 'Priya Sharma', date: '2 Aug',  days: 1, status: 'pending',  reason: 'Project focus'  },
  { employeeId: 'EMP-006', employeeName: 'Divya Nair',   date: '10 Jun', days: 1, status: 'rejected', reason: 'Home relocation' },
]

// Late attendance report
export const LATE_REPORT_ROWS: ReportRow[] = [
  { employeeId: 'EMP-003', employeeName: 'Mohit Jain',   date: '8 Jul 2026',  checkIn: '10:22 AM', status: 'late', reason: 'Traffic jam'     },
  { employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  date: '8 Jul 2026',  checkIn: '10:35 AM', status: 'late', reason: 'Overslept'       },
  { employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  date: '7 Jul 2026',  checkIn: '10:15 AM', status: 'late', reason: ''               },
  { employeeId: 'EMP-003', employeeName: 'Mohit Jain',   date: '15 Jun 2026', checkIn: '10:40 AM', status: 'late', reason: 'Doctor visit'    },
  { employeeId: 'EMP-011', employeeName: 'Vijay Reddy',  date: '3 Jul 2026',  checkIn: '10:30 AM', status: 'late', reason: 'Power outage'    },
]

// ── Report config ──────────────────────────────────────────────────────────────

export type ReportType = 'daily' | 'monthly' | 'employee' | 'leave' | 'wfh' | 'late'

export interface ReportOption {
  type: ReportType
  label: string
  description: string
}

export const REPORT_OPTIONS: ReportOption[] = [
  { type: 'daily',    label: 'Daily Attendance',    description: 'All employee attendance for a single day'      },
  { type: 'monthly',  label: 'Monthly Attendance',  description: 'Monthly summary per employee'                  },
  { type: 'employee', label: 'Employee-wise',        description: 'Full history for a specific employee'          },
  { type: 'leave',    label: 'Leave Report',         description: 'All leave requests and their status'           },
  { type: 'wfh',      label: 'WFH Report',           description: 'All work from home requests'                   },
  { type: 'late',     label: 'Late Attendance',      description: 'Employees who checked in after grace period'   },
]

export function getMockRows(type: ReportType): ReportRow[] {
  switch (type) {
    case 'daily':    return DAILY_REPORT_ROWS
    case 'monthly':  return MONTHLY_REPORT_ROWS
    case 'employee': return DAILY_REPORT_ROWS.slice(0, 5)
    case 'leave':    return LEAVE_REPORT_ROWS
    case 'wfh':      return WFH_REPORT_ROWS
    case 'late':     return LATE_REPORT_ROWS
    default:         return []
  }
}

// ── Audit Log entries ────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string
  dateTime: string       // "8 Jul 2026, 2:34 PM"
  rawDate: string        // "2026-07-08" for sorting/filtering
  employeeName: string
  employeeId: string
  changedBy: string      // "Ajay Singh"
  changeType: string     // "Status" | "Check-in time" | "Check-out time"
  previousValue: string
  newValue: string
  reason: string
}

export const MOCK_AUDIT: AuditEntry[] = [
  { id: 'au1',  dateTime: '8 Jul 2026, 2:34 PM',  rawDate: '2026-07-08', employeeName: 'Divya Nair',   employeeId: 'EMP-006', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Absent',     newValue: 'Present',     reason: 'Employee was present but app failed to record'             },
  { id: 'au2',  dateTime: '8 Jul 2026, 11:20 AM', rawDate: '2026-07-08', employeeName: 'Rahul Kumar',  employeeId: 'EMP-001', changedBy: 'Ajay Singh', changeType: 'Check-out time', previousValue: '—',          newValue: '07:12 PM',    reason: 'Employee forgot to check out'                              },
  { id: 'au3',  dateTime: '7 Jul 2026, 4:15 PM',  rawDate: '2026-07-07', employeeName: 'Mohit Jain',   employeeId: 'EMP-003', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Late',       newValue: 'Present',     reason: 'Office start time was adjusted for that day'               },
  { id: 'au4',  dateTime: '5 Jul 2026, 10:05 AM', rawDate: '2026-07-05', employeeName: 'Kavya Pillai', employeeId: 'EMP-008', changedBy: 'Ajay Singh', changeType: 'Check-in time', previousValue: '10:45 AM',   newValue: '10:05 AM',    reason: 'Employee checked in via alternate device, time was wrong'  },
  { id: 'au5',  dateTime: '4 Jul 2026, 6:50 PM',  rawDate: '2026-07-04', employeeName: 'Sneha Verma',  employeeId: 'EMP-002', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Absent',     newValue: 'WFH',         reason: 'Admin approved WFH request retrospectively'                },
  { id: 'au6',  dateTime: '3 Jul 2026, 3:22 PM',  rawDate: '2026-07-03', employeeName: 'Arjun Mehta',  employeeId: 'EMP-007', changedBy: 'Ajay Singh', changeType: 'Check-out time', previousValue: '—',          newValue: '07:40 PM',    reason: 'App crashed during checkout, employee reported manually'   },
  { id: 'au7',  dateTime: '2 Jul 2026, 9:30 AM',  rawDate: '2026-07-02', employeeName: 'Rohan Gupta',  employeeId: 'EMP-009', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Absent',     newValue: 'Leave',       reason: 'Leave approved retroactively for medical emergency'        },
  { id: 'au8',  dateTime: '1 Jul 2026, 5:00 PM',  rawDate: '2026-07-01', employeeName: 'Priya Sharma', employeeId: 'EMP-004', changedBy: 'Ajay Singh', changeType: 'Check-in time', previousValue: '10:00 AM',   newValue: '09:45 AM',    reason: 'Biometric sync delayed, actual arrival was earlier'        },
  { id: 'au9',  dateTime: '28 Jun 2026, 2:10 PM', rawDate: '2026-06-28', employeeName: 'Vijay Reddy',  employeeId: 'EMP-011', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Late',       newValue: 'Present',     reason: 'Power outage caused server time sync issue'                },
  { id: 'au10', dateTime: '25 Jun 2026, 11:45 AM',rawDate: '2026-06-25', employeeName: 'Neha Agarwal', employeeId: 'EMP-010', changedBy: 'Ajay Singh', changeType: 'Check-out time', previousValue: '05:30 PM',   newValue: '07:00 PM',    reason: 'Employee had meeting extension, checkout updated'          },
  { id: 'au11', dateTime: '22 Jun 2026, 9:00 AM', rawDate: '2026-06-22', employeeName: 'Divya Nair',   employeeId: 'EMP-006', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Present',    newValue: 'Leave',       reason: 'Emergency leave approved same day'                         },
  { id: 'au12', dateTime: '18 Jun 2026, 4:30 PM', rawDate: '2026-06-18', employeeName: 'Mohit Jain',   employeeId: 'EMP-003', changedBy: 'Ajay Singh', changeType: 'Check-in time', previousValue: '10:40 AM',   newValue: '10:05 AM',    reason: 'GPS glitch recorded wrong time'                            },
  { id: 'au13', dateTime: '15 Jun 2026, 3:00 PM', rawDate: '2026-06-15', employeeName: 'Amit Khanna',  employeeId: 'EMP-005', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Absent',     newValue: 'WFH',         reason: 'WFH request was submitted but not auto-approved'           },
  { id: 'au14', dateTime: '10 Jun 2026, 10:15 AM',rawDate: '2026-06-10', employeeName: 'Kavya Pillai', employeeId: 'EMP-008', changedBy: 'Ajay Singh', changeType: 'Check-out time', previousValue: '06:00 PM',   newValue: '07:15 PM',    reason: 'Client call overran, employee reported correct time'       },
  { id: 'au15', dateTime: '5 Jun 2026, 5:45 PM',  rawDate: '2026-06-05', employeeName: 'Rahul Kumar',  employeeId: 'EMP-001', changedBy: 'Ajay Singh', changeType: 'Status',        previousValue: 'Late',       newValue: 'Present',     reason: 'Correction request approved — traffic verified'            },
]

export const EMPLOYEE_OPTIONS = [
  { value: 'all',     label: 'All employees'  },
  { value: 'EMP-001', label: 'Rahul Kumar'    },
  { value: 'EMP-002', label: 'Sneha Verma'    },
  { value: 'EMP-003', label: 'Mohit Jain'     },
  { value: 'EMP-004', label: 'Priya Sharma'   },
  { value: 'EMP-005', label: 'Amit Khanna'    },
  { value: 'EMP-006', label: 'Divya Nair'     },
  { value: 'EMP-007', label: 'Arjun Mehta'    },
  { value: 'EMP-008', label: 'Kavya Pillai'   },
  { value: 'EMP-009', label: 'Rohan Gupta'    },
  { value: 'EMP-010', label: 'Neha Agarwal'   },
  { value: 'EMP-011', label: 'Vijay Reddy'    },
]
