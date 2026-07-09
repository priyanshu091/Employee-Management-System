import type { RequestStatus } from '@/types'

// ── Leave Requests ───────────────────────────────────────────────────────────

export interface MockLeaveRequest {
  id: string
  leaveType: string
  startDate: string   // "2026-07-17"
  endDate: string     // "2026-07-18"
  dateRange: string   // "17–18 Jul 2026"
  duration: string    // "2 days"
  reason: string
  submittedOn: string // "10 Jul 2026"
  status: RequestStatus
}

export const MOCK_LEAVE_REQUESTS: MockLeaveRequest[] = [
  {
    id: 'l1',
    leaveType: 'Casual Leave',
    startDate: '2026-07-17',
    endDate: '2026-07-18',
    dateRange: '17–18 Jul 2026',
    duration: '2 days',
    reason: "Family event — sister's engagement ceremony",
    submittedOn: '10 Jul 2026',
    status: 'pending',
  },
  {
    id: 'l2',
    leaveType: 'Sick Leave',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    dateRange: '20 Jun 2026',
    duration: '1 day',
    reason: 'Fever and cold, doctor visit',
    submittedOn: '20 Jun 2026',
    status: 'approved',
  },
  {
    id: 'l3',
    leaveType: 'Earned Leave',
    startDate: '2026-05-25',
    endDate: '2026-05-27',
    dateRange: '25–27 May 2026',
    duration: '3 days',
    reason: 'Personal vacation — planned travel',
    submittedOn: '18 May 2026',
    status: 'approved',
  },
  {
    id: 'l4',
    leaveType: 'Casual Leave',
    startDate: '2026-04-10',
    endDate: '2026-04-10',
    dateRange: '10 Apr 2026',
    duration: '1 day',
    reason: 'Personal work',
    submittedOn: '8 Apr 2026',
    status: 'rejected',
  },
  {
    id: 'l5',
    leaveType: 'Emergency Leave',
    startDate: '2026-03-05',
    endDate: '2026-03-06',
    dateRange: '5–6 Mar 2026',
    duration: '2 days',
    reason: 'Family medical emergency',
    submittedOn: '5 Mar 2026',
    status: 'approved',
  },
  {
    id: 'l6',
    leaveType: 'Sick Leave',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    dateRange: '14 Feb 2026',
    duration: '1 day',
    reason: 'Not feeling well',
    submittedOn: '14 Feb 2026',
    status: 'rejected',
  },
]

// ── WFH Requests ──────────────────────────────────────────────────────────────

export interface MockWFHRequest {
  id: string
  date: string        // "2026-07-25"
  dateLabel: string   // "25 Jul 2026"
  reason: string
  submittedOn: string
  status: RequestStatus
}

export const MOCK_WFH_REQUESTS: MockWFHRequest[] = [
  {
    id: 'w1',
    date: '2026-07-25',
    dateLabel: '25 Jul 2026',
    reason: 'Internet technician visit scheduled at home',
    submittedOn: '22 Jul 2026',
    status: 'approved',
  },
  {
    id: 'w2',
    date: '2026-07-14',
    dateLabel: '14 Jul 2026',
    reason: 'Child is unwell, cannot leave home',
    submittedOn: '13 Jul 2026',
    status: 'approved',
  },
  {
    id: 'w3',
    date: '2026-08-02',
    dateLabel: '2 Aug 2026',
    reason: 'Deep focus work on project milestone',
    submittedOn: '30 Jul 2026',
    status: 'pending',
  },
  {
    id: 'w4',
    date: '2026-06-10',
    dateLabel: '10 Jun 2026',
    reason: 'Home relocation — moving boxes',
    submittedOn: '8 Jun 2026',
    status: 'rejected',
  },
]

// ── Correction Requests ─────────────────────────────────────────────────────────

export interface MockCorrectionRequest {
  id: string
  date: string        // "2026-07-02"
  dateLabel: string   // "2 Jul 2026"
  reason: string
  requestedCheckIn?: string   // "09:45 AM"
  requestedCheckOut?: string  // "07:00 PM"
  submittedOn: string
  status: RequestStatus
}

export const MOCK_CORRECTION_REQUESTS: MockCorrectionRequest[] = [
  {
    id: 'c1',
    date: '2026-07-02',
    dateLabel: '2 Jul 2026',
    reason: 'Forgot to check out before leaving office',
    requestedCheckIn: '10:02 AM',
    requestedCheckOut: '07:10 PM',
    submittedOn: '3 Jul 2026',
    status: 'approved',
  },
  {
    id: 'c2',
    date: '2026-06-18',
    dateLabel: '18 Jun 2026',
    reason: 'Phone was dead, could not check in on the app',
    requestedCheckIn: '09:55 AM',
    requestedCheckOut: '',
    submittedOn: '19 Jun 2026',
    status: 'rejected',
  },
  {
    id: 'c3',
    date: '2026-05-30',
    dateLabel: '30 May 2026',
    reason: 'App crashed during check-in, attendance not recorded',
    requestedCheckIn: '10:00 AM',
    requestedCheckOut: '07:00 PM',
    submittedOn: '31 May 2026',
    status: 'pending',
  },
]
