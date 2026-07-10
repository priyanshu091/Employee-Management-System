// ── Holidays ───────────────────────────────────────────────────────────────────

export interface MockHoliday {
  id: string
  name: string
  date: string      // ISO "2026-01-26"
  day: string       // "Monday"
  dayNum: string    // "26"
  month: string     // "Jan"
  upcoming: boolean // true if date >= today
}

function buildHoliday(
  id: string,
  name: string,
  dateStr: string
): MockHoliday {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return {
    id,
    name,
    date: dateStr,
    day: d.toLocaleDateString('en-IN', { weekday: 'long' }),
    dayNum: String(d.getDate()),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    upcoming: d >= today,
  }
}

export const MOCK_HOLIDAYS: MockHoliday[] = [
  buildHoliday('h1', 'Republic Day',         '2026-01-26'),
  buildHoliday('h2', 'Holi',                 '2026-03-04'),
  buildHoliday('h3', 'Good Friday',          '2026-04-03'),
  buildHoliday('h4', 'Independence Day',     '2026-08-15'),
  buildHoliday('h5', 'Gandhi Jayanti',       '2026-10-02'),
  buildHoliday('h6', 'Diwali',               '2026-10-20'),
  buildHoliday('h7', 'Diwali Holiday',       '2026-10-21'),
  buildHoliday('h8', 'Christmas',            '2026-12-25'),
]

// ── Notifications ────────────────────────────────────────────────────────────────

export type NotifType = 'leave_approved' | 'leave_rejected' | 'wfh_approved' | 'wfh_rejected' | 'correction_approved' | 'correction_rejected' | 'reminder'

export interface MockNotification {
  id: string
  type: NotifType
  title: string
  message: string
  time: string      // "2 hours ago"
  isRead: boolean
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'wfh_approved',
    title: 'WFH Request Approved',
    message: 'Your work from home request for 25 Jul 2026 has been approved.',
    time: '10 minutes ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'leave_rejected',
    title: 'Leave Request Rejected',
    message: 'Your casual leave request for 17–18 Jul 2026 was not approved. Please check with your admin.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Forgot to Check Out',
    message: 'You did not check out yesterday (7 Jul). Please submit a correction request if needed.',
    time: 'Yesterday, 8:00 PM',
    isRead: false,
  },
  {
    id: 'n4',
    type: 'correction_approved',
    title: 'Correction Request Approved',
    message: 'Your attendance correction for 2 Jul 2026 has been updated by the admin.',
    time: '3 Jul 2026',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'leave_approved',
    title: 'Leave Request Approved',
    message: 'Your sick leave for 20 Jun 2026 has been approved.',
    time: '20 Jun 2026',
    isRead: true,
  },
  {
    id: 'n6',
    type: 'wfh_rejected',
    title: 'WFH Request Rejected',
    message: 'Your WFH request for 10 Jun 2026 was not approved.',
    time: '9 Jun 2026',
    isRead: true,
  },
  {
    id: 'n7',
    type: 'correction_rejected',
    title: 'Correction Request Rejected',
    message: 'Your correction request for 18 Jun 2026 was reviewed and not approved.',
    time: '19 Jun 2026',
    isRead: true,
  },
]

// ── Company Settings defaults ──────────────────────────────────────────────────────

export interface CompanySettingsForm {
  companyName: string
  officeAddress: string
  officeLat: string
  officeLng: string
  allowedRadiusKm: number
  officeStartTime: string
  officeEndTime: string
  gracePeriodMinutes: number
  attendanceLockTime: string
}

export const DEFAULT_SETTINGS: CompanySettingsForm = {
  companyName:          'FeelifyEMS Corp',
  officeAddress:        '12 MG Road, Lucknow, Uttar Pradesh 226001',
  officeLat:            '26.8467',
  officeLng:            '80.9462',
  allowedRadiusKm:      1.0,
  officeStartTime:      '10:00',
  officeEndTime:        '19:00',
  gracePeriodMinutes:   10,
  attendanceLockTime:   '23:59',
}
