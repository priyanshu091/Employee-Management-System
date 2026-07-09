import type { EmployeeStatus, AttendanceStatus, AttendanceType } from '@/types'

export interface MockEmployee {
  id: string
  employeeId: string       // "EMP-001"
  fullName: string
  email: string
  phone: string
  department: string
  designation: string
  joiningDate: string      // "15 Jan 2024"
  status: EmployeeStatus
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: 'e1',  employeeId: 'EMP-001', fullName: 'Rahul Kumar',   email: 'rahul@company.com',   phone: '+91 98765 43210', department: 'Engineering', designation: 'Frontend Developer',   joiningDate: '15 Jan 2024', status: 'active'   },
  { id: 'e2',  employeeId: 'EMP-002', fullName: 'Sneha Verma',   email: 'sneha@company.com',   phone: '+91 87654 32109', department: 'Design',       designation: 'UI/UX Designer',       joiningDate: '3 Mar 2024',  status: 'active'   },
  { id: 'e3',  employeeId: 'EMP-003', fullName: 'Mohit Jain',    email: 'mohit@company.com',   phone: '+91 76543 21098', department: 'Sales',        designation: 'Sales Executive',      joiningDate: '10 Feb 2024', status: 'active'   },
  { id: 'e4',  employeeId: 'EMP-004', fullName: 'Priya Sharma',  email: 'priya@company.com',   phone: '+91 65432 10987', department: 'Marketing',    designation: 'Marketing Manager',    joiningDate: '20 Apr 2024', status: 'active'   },
  { id: 'e5',  employeeId: 'EMP-005', fullName: 'Amit Khanna',   email: 'amit@company.com',    phone: '+91 54321 09876', department: 'Engineering', designation: 'Backend Developer',    joiningDate: '1 May 2024',  status: 'active'   },
  { id: 'e6',  employeeId: 'EMP-006', fullName: 'Divya Nair',    email: 'divya@company.com',   phone: '+91 43210 98765', department: 'HR',           designation: 'HR Executive',         joiningDate: '12 Jun 2024', status: 'active'   },
  { id: 'e7',  employeeId: 'EMP-007', fullName: 'Arjun Mehta',   email: 'arjun@company.com',   phone: '+91 32109 87654', department: 'Engineering', designation: 'Full Stack Developer', joiningDate: '5 Jul 2024',  status: 'active'   },
  { id: 'e8',  employeeId: 'EMP-008', fullName: 'Kavya Pillai',  email: 'kavya@company.com',   phone: '+91 21098 76543', department: 'Design',       designation: 'Graphic Designer',     joiningDate: '18 Aug 2024', status: 'active'   },
  { id: 'e9',  employeeId: 'EMP-009', fullName: 'Rohan Gupta',   email: 'rohan@company.com',   phone: '+91 10987 65432', department: 'Sales',        designation: 'Business Developer',   joiningDate: '2 Sep 2024',  status: 'inactive' },
  { id: 'e10', employeeId: 'EMP-010', fullName: 'Neha Agarwal',  email: 'neha@company.com',    phone: '+91 09876 54321', department: 'Marketing',    designation: 'Content Strategist',   joiningDate: '15 Oct 2024', status: 'active'   },
  { id: 'e11', employeeId: 'EMP-011', fullName: 'Vijay Reddy',   email: 'vijay@company.com',   phone: '+91 98765 12345', department: 'Engineering', designation: 'DevOps Engineer',      joiningDate: '7 Nov 2024',  status: 'active'   },
  { id: 'e12', employeeId: 'EMP-012', fullName: 'Sonal Desai',   email: 'sonal@company.com',   phone: '+91 87654 23456', department: 'HR',           designation: 'HR Manager',           joiningDate: '20 Dec 2024', status: 'inactive' },
]

export const DEPARTMENTS = ['Engineering', 'Design', 'Sales', 'Marketing', 'HR']

// ── Admin Attendance Records ──────────────────────────────────────────────────

export interface AdminAttendanceRow {
  id: string
  employeeId: string      // "EMP-001"
  employeeName: string
  date: string            // "8 Jul 2026"
  rawDate: string         // "2026-07-08" for sorting
  type: AttendanceType
  checkIn: string         // "10:04 AM" or ""
  checkOut: string        // "07:12 PM" or ""
  workingHours: string    // "9h 08m" or "—"
  status: AttendanceStatus
}

export const ADMIN_ATTENDANCE: AdminAttendanceRow[] = [
  { id: 'a1',  employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '10:04 AM', checkOut: '07:12 PM', workingHours: '9h 08m', status: 'present'  },
  { id: 'a2',  employeeId: 'EMP-002', employeeName: 'Sneha Verma',  date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '09:58 AM', checkOut: '07:00 PM', workingHours: '9h 02m', status: 'present'  },
  { id: 'a3',  employeeId: 'EMP-003', employeeName: 'Mohit Jain',   date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '10:22 AM', checkOut: '07:30 PM', workingHours: '9h 08m', status: 'late'     },
  { id: 'a4',  employeeId: 'EMP-004', employeeName: 'Priya Sharma', date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '09:45 AM', checkOut: '06:50 PM', workingHours: '9h 05m', status: 'present'  },
  { id: 'a5',  employeeId: 'EMP-005', employeeName: 'Amit Khanna',  date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'wfh',    checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'wfh'      },
  { id: 'a6',  employeeId: 'EMP-006', employeeName: 'Divya Nair',   date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '',         checkOut: '',         workingHours: '—',      status: 'absent'   },
  { id: 'a7',  employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '10:35 AM', checkOut: '07:40 PM', workingHours: '9h 05m', status: 'late'     },
  { id: 'a8',  employeeId: 'EMP-008', employeeName: 'Kavya Pillai', date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'present'  },
  { id: 'a9',  employeeId: 'EMP-009', employeeName: 'Rohan Gupta',  date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'office', checkIn: '',         checkOut: '',         workingHours: '—',      status: 'leave'    },
  { id: 'a10', employeeId: 'EMP-010', employeeName: 'Neha Agarwal', date: '8 Jul 2026',  rawDate: '2026-07-08', type: 'wfh',    checkIn: '09:50 AM', checkOut: '06:55 PM', workingHours: '9h 05m', status: 'wfh'      },
  { id: 'a11', employeeId: 'EMP-001', employeeName: 'Rahul Kumar',  date: '7 Jul 2026',  rawDate: '2026-07-07', type: 'office', checkIn: '09:55 AM', checkOut: '07:05 PM', workingHours: '9h 10m', status: 'present'  },
  { id: 'a12', employeeId: 'EMP-002', employeeName: 'Sneha Verma',  date: '7 Jul 2026',  rawDate: '2026-07-07', type: 'office', checkIn: '10:02 AM', checkOut: '07:10 PM', workingHours: '9h 08m', status: 'present'  },
  { id: 'a13', employeeId: 'EMP-003', employeeName: 'Mohit Jain',   date: '7 Jul 2026',  rawDate: '2026-07-07', type: 'office', checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'present'  },
  { id: 'a14', employeeId: 'EMP-005', employeeName: 'Amit Khanna',  date: '7 Jul 2026',  rawDate: '2026-07-07', type: 'office', checkIn: '10:15 AM', checkOut: '07:20 PM', workingHours: '9h 05m', status: 'late'     },
  { id: 'a15', employeeId: 'EMP-006', employeeName: 'Divya Nair',   date: '7 Jul 2026',  rawDate: '2026-07-07', type: 'office', checkIn: '09:48 AM', checkOut: '06:58 PM', workingHours: '9h 10m', status: 'present'  },
  { id: 'a16', employeeId: 'EMP-007', employeeName: 'Arjun Mehta',  date: '4 Jul 2026',  rawDate: '2026-07-04', type: 'office', checkIn: '10:05 AM', checkOut: '07:05 PM', workingHours: '9h 00m', status: 'present'  },
  { id: 'a17', employeeId: 'EMP-008', employeeName: 'Kavya Pillai', date: '4 Jul 2026',  rawDate: '2026-07-04', type: 'wfh',    checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m', status: 'wfh'      },
  { id: 'a18', employeeId: 'EMP-010', employeeName: 'Neha Agarwal', date: '4 Jul 2026',  rawDate: '2026-07-04', type: 'office', checkIn: '',         checkOut: '',         workingHours: '—',      status: 'absent'   },
  { id: 'a19', employeeId: 'EMP-011', employeeName: 'Vijay Reddy',  date: '3 Jul 2026',  rawDate: '2026-07-03', type: 'office', checkIn: '10:30 AM', checkOut: '07:35 PM', workingHours: '9h 05m', status: 'late'     },
  { id: 'a20', employeeId: 'EMP-012', employeeName: 'Sonal Desai',  date: '3 Jul 2026',  rawDate: '2026-07-03', type: 'office', checkIn: '09:50 AM', checkOut: '07:00 PM', workingHours: '9h 10m', status: 'present'  },
]
