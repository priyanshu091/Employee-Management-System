// ── Dashboard Stats ───────────────────────────────────────────────────────────

export interface DashboardStat {
  label: string
  value: number
  dotColor: string
}

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: 'Total employees', value: 24, dotColor: '#9CA3AF' },
  { label: 'Present today',   value: 18, dotColor: '#16A34A' },
  { label: 'Absent today',    value: 2,  dotColor: '#DC2626' },
  { label: 'Late today',      value: 3,  dotColor: '#D97706' },
  { label: 'On WFH',         value: 4,  dotColor: '#2563EB' },
  { label: 'On leave',        value: 1,  dotColor: '#7C3AED' },
]

// ── Pending Requests ──────────────────────────────────────────────────────────

export type RequestCategory = 'leave' | 'wfh' | 'correction'

export interface PendingRequest {
  id: string
  category: RequestCategory
  employeeName: string
  employeeInitials: string
  details: string       // "Casual · 17–18 Jul · Family event"
}

export const PENDING_REQUESTS: PendingRequest[] = [
  // Leave (3)
  {
    id: 'pr1',
    category: 'leave',
    employeeName: 'Rahul Kumar',
    employeeInitials: 'RK',
    details: 'Casual · 17–18 Jul · Family engagement ceremony',
  },
  {
    id: 'pr2',
    category: 'leave',
    employeeName: 'Sneha Verma',
    employeeInitials: 'SV',
    details: 'Sick · 10 Jul · Not feeling well',
  },
  {
    id: 'pr3',
    category: 'leave',
    employeeName: 'Mohit Jain',
    employeeInitials: 'MJ',
    details: 'Earned · 21–22 Jul · Personal work',
  },
  // WFH (2)
  {
    id: 'pr4',
    category: 'wfh',
    employeeName: 'Priya Sharma',
    employeeInitials: 'PS',
    details: '2 Aug 2026 · Internet technician at home',
  },
  {
    id: 'pr5',
    category: 'wfh',
    employeeName: 'Amit Khanna',
    employeeInitials: 'AK',
    details: '5 Aug 2026 · Deep focus project milestone',
  },
  // Correction (1)
  {
    id: 'pr6',
    category: 'correction',
    employeeName: 'Divya Nair',
    employeeInitials: 'DN',
    details: '3 Jul 2026 · Forgot to check out',
  },
]

// ── Who Is In Office ──────────────────────────────────────────────────────────

export interface OfficePresence {
  id: string
  name: string
  initials: string
  department: string
  since: string   // "Since 10:04 AM"
}

export const IN_OFFICE: OfficePresence[] = [
  { id: 'o1', name: 'Rahul Kumar',  initials: 'RK', department: 'Engineering', since: 'Since 10:04 AM' },
  { id: 'o2', name: 'Sneha Verma',  initials: 'SV', department: 'Design',      since: 'Since 9:58 AM'  },
  { id: 'o3', name: 'Mohit Jain',   initials: 'MJ', department: 'Sales',       since: 'Since 10:22 AM' },
  { id: 'o4', name: 'Priya Sharma', initials: 'PS', department: 'Marketing',   since: 'Since 9:45 AM'  },
  { id: 'o5', name: 'Amit Khanna',  initials: 'AK', department: 'Engineering', since: 'Since 10:10 AM' },
]

export const TOTAL_IN_OFFICE = 12
