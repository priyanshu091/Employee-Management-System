// ── Enums ──────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee'
export type EmployeeStatus = 'active' | 'inactive'
export type AttendanceType = 'office' | 'wfh'
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'wfh'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type NotificationType = 'leave' | 'wfh' | 'correction' | 'reminder'
export type ReportType =
  | 'daily'
  | 'monthly'
  | 'employee'
  | 'leave'
  | 'wfh'
  | 'late'

// ── Database Row Types ──────────────────────────────────────────────────────

export interface Profile {
  id: string
  employee_id: string
  full_name: string
  email: string
  phone: string | null
  department: string | null
  designation: string | null
  joining_date: string | null
  role: UserRole
  status: EmployeeStatus
  avatar_url: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in: string | null
  check_out: string | null
  type: AttendanceType
  status: AttendanceStatus
  working_hours: number | null
  late_reason: string | null
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface WFHRequest {
  id: string
  employee_id: string
  date: string
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface CorrectionRequest {
  id: string
  employee_id: string
  date: string
  reason: string
  requested_check_in: string | null
  requested_check_out: string | null
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  created_by: string
  created_at: string
}

export interface AuditLog {
  id: string
  target_type: string
  target_id: string
  employee_id: string
  changed_by: string
  previous_value: Record<string, unknown>
  new_value: Record<string, unknown>
  reason: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface CompanySettings {
  id: string
  company_name: string
  office_address: string
  office_lat: number
  office_lng: number
  allowed_radius_km: number
  office_start_time: string
  office_end_time: string
  grace_period_minutes: number
  logo_url: string | null
  attendance_lock_time: string
  updated_at: string
}

// ── API Response Types ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Joined / Extended Types ─────────────────────────────────────────────────

export interface AttendanceWithProfile extends Attendance {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'department' | 'avatar_url'>
}

export interface LeaveRequestWithProfile extends LeaveRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface WFHRequestWithProfile extends WFHRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface CorrectionRequestWithProfile extends CorrectionRequest {
  profile: Pick<Profile, 'full_name' | 'employee_id' | 'avatar_url'>
}

export interface AuditLogWithProfiles extends AuditLog {
  affected: Pick<Profile, 'full_name' | 'employee_id'>
  changer: Pick<Profile, 'full_name'>
}

// ── Report Types ────────────────────────────────────────────────────────────

export interface DailyReportRow {
  employee_name: string
  employee_id: string
  department?: string
  date: string
  check_in: string | null
  check_out: string | null
  working_hours: number | string | null
  status: AttendanceStatus
}

export interface MonthlyReportRow {
  employee_name: string
  employee_id: string
  department: string
  present_days: number
  late_days: number
  wfh_days: number
  leave_days: number
  total_working_hours: number | string | null
}

export interface LeaveReportRow {
  employee_name: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days: number
  status: RequestStatus
}

export interface WFHReportRow {
  employee_name: string
  employee_id: string
  date: string
  reason: string
  status: RequestStatus
}

export interface LateReportRow {
  employee_name: string
  employee_id: string
  department: string
  date: string
  check_in: string
  late_reason: string | null
}

export type ReportRow = DailyReportRow | MonthlyReportRow | LeaveReportRow | WFHReportRow | LateReportRow
