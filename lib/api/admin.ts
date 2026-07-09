import type {
  Profile, AttendanceWithProfile, Holiday, CompanySettings,
  LeaveRequestWithProfile, WFHRequestWithProfile, CorrectionRequestWithProfile,
  AuditLogWithProfiles,
} from '@/types'

interface DashboardStats {
  totalEmployees: number
  present: number
  absent: number
  late: number
  wfh: number
  onLeave: number
}

interface InOfficeRow {
  employee_id: string
  check_in: string
  profiles: { full_name: string; department: string | null } | null
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{ stats: DashboardStats; inOffice: InOfficeRow[] } | null> {
  const res = await fetch('/api/admin/stats')
  const json = await res.json()
  return json.data ?? null
}

// ── Employees ────────────────────────────────────────────────────────────────

export async function getAllEmployees(): Promise<Profile[]> {
  const res = await fetch('/api/employees')
  const json = await res.json()
  return json.data ?? []
}

export async function createEmployee(data: {
  full_name: string
  email: string
  phone?: string
  department: string
  designation: string
  joining_date: string
}) {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateEmployee(id: string, updates: Record<string, unknown>) {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return res.json()
}

// ── Pending Requests ─────────────────────────────────────────────────────────

export async function getPendingRequests(): Promise<{
  leave: LeaveRequestWithProfile[]
  wfh: WFHRequestWithProfile[]
  correction: CorrectionRequestWithProfile[]
}> {
  const [leaveRes, wfhRes, corrRes] = await Promise.all([
    fetch('/api/leave?admin=true&status=pending'),
    fetch('/api/wfh?admin=true&status=pending'),
    fetch('/api/correction?admin=true&status=pending'),
  ])
  const [leave, wfh, correction] = await Promise.all([
    leaveRes.json(), wfhRes.json(), corrRes.json(),
  ])
  return {
    leave: leave.data ?? [],
    wfh: wfh.data ?? [],
    correction: correction.data ?? [],
  }
}

export async function reviewRequest(
  category: 'leave' | 'wfh' | 'correction',
  id: string,
  action: 'approved' | 'rejected',
  reason?: string
) {
  const res = await fetch(`/api/${category}/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reason }),
  })
  return res.json()
}

// ── Admin Attendance ─────────────────────────────────────────────────────────

export async function getAdminAttendance(params?: {
  month?: string
  employee?: string
  status?: string
}): Promise<AttendanceWithProfile[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`/api/attendance?${query}`)
  const json = await res.json()
  return json.data ?? []
}

export async function updateAttendance(data: {
  id: string
  check_in?: string | null
  check_out?: string | null
  reason: string
}) {
  const res = await fetch('/api/attendance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

// ── Holidays ─────────────────────────────────────────────────────────────────

export async function getHolidays(): Promise<Holiday[]> {
  const res = await fetch('/api/holidays')
  const json = await res.json()
  return json.data ?? []
}

export async function createHoliday(data: { name: string; date: string }) {
  const res = await fetch('/api/holidays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteHoliday(id: string) {
  const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE' })
  return res.json()
}

// ── Audit Log ────────────────────────────────────────────────────────────────

export async function getAuditLog(params?: {
  employee?: string
  from?: string
  to?: string
}): Promise<AuditLogWithProfiles[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`/api/audit?${query}`)
  const json = await res.json()
  return json.data ?? []
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<CompanySettings | null> {
  const res = await fetch('/api/settings')
  const json = await res.json()
  return json.data ?? null
}

export async function updateSettings(updates: Record<string, unknown>) {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return res.json()
}
