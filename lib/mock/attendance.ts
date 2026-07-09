import type { AttendanceStatus, AttendanceType } from '@/types'

export interface MockAttendanceDay {
  date: number          // day of month
  month: number         // 0-indexed (6 = July)
  year: number
  status: AttendanceStatus
  type: AttendanceType
  checkIn: string       // "10:04 AM"
  checkOut: string      // "7:12 PM" or "" if absent/leave
  workingHours: string  // "9h 08m" or "--"
}

export const MOCK_ATTENDANCE: MockAttendanceDay[] = [
  { date: 1,  month: 6, year: 2026, status: 'present', type: 'office', checkIn: '09:58 AM', checkOut: '07:05 PM', workingHours: '9h 07m' },
  { date: 2,  month: 6, year: 2026, status: 'present', type: 'office', checkIn: '10:02 AM', checkOut: '07:10 PM', workingHours: '9h 08m' },
  { date: 3,  month: 6, year: 2026, status: 'late',    type: 'office', checkIn: '10:25 AM', checkOut: '07:30 PM', workingHours: '9h 05m' },
  { date: 4,  month: 6, year: 2026, status: 'present', type: 'office', checkIn: '09:55 AM', checkOut: '07:00 PM', workingHours: '9h 05m' },
  { date: 7,  month: 6, year: 2026, status: 'present', type: 'office', checkIn: '10:00 AM', checkOut: '07:15 PM', workingHours: '9h 15m' },
  { date: 8,  month: 6, year: 2026, status: 'present', type: 'office', checkIn: '10:04 AM', checkOut: '',         workingHours: '--'     },
  { date: 9,  month: 6, year: 2026, status: 'absent',  type: 'office', checkIn: '',         checkOut: '',         workingHours: '--'     },
  { date: 10, month: 6, year: 2026, status: 'present', type: 'office', checkIn: '09:50 AM', checkOut: '07:00 PM', workingHours: '9h 10m' },
  { date: 11, month: 6, year: 2026, status: 'present', type: 'office', checkIn: '10:05 AM', checkOut: '07:05 PM', workingHours: '9h 00m' },
  { date: 14, month: 6, year: 2026, status: 'wfh',     type: 'wfh',    checkIn: '10:00 AM', checkOut: '07:00 PM', workingHours: '9h 00m' },
  { date: 15, month: 6, year: 2026, status: 'late',    type: 'office', checkIn: '10:35 AM', checkOut: '07:40 PM', workingHours: '9h 05m' },
  { date: 16, month: 6, year: 2026, status: 'present', type: 'office', checkIn: '09:58 AM', checkOut: '07:10 PM', workingHours: '9h 12m' },
  { date: 17, month: 6, year: 2026, status: 'leave',   type: 'office', checkIn: '',         checkOut: '',         workingHours: '--'     },
  { date: 18, month: 6, year: 2026, status: 'leave',   type: 'office', checkIn: '',         checkOut: '',         workingHours: '--'     },
  { date: 21, month: 6, year: 2026, status: 'present', type: 'office', checkIn: '10:03 AM', checkOut: '07:00 PM', workingHours: '8h 57m' },
]

// Build a lookup map: key = "YYYY-M-D"
export const ATTENDANCE_MAP: Record<string, MockAttendanceDay> = {}
MOCK_ATTENDANCE.forEach((d) => {
  ATTENDANCE_MAP[`${d.year}-${d.month}-${d.date}`] = d
})

export function getAttendanceForDay(
  year: number,
  month: number,
  date: number
): MockAttendanceDay | undefined {
  return ATTENDANCE_MAP[`${year}-${month}-${date}`]
}
