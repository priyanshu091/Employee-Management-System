import { createClient } from '@/lib/supabase/client'
import type {
  Attendance, LeaveRequest, WFHRequest,
  CorrectionRequest, Notification, Profile, CompanySettings,
} from '@/types'

// ── Profile ─────────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

// ── Attendance ────────────────────────────────────────────────────────────────────

export async function getTodayAttendance(): Promise<Attendance | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', user.id)
    .eq('date', today)
    .maybeSingle()

  return data
}

export async function getMonthlyStats(): Promise<{
  present: number; late: number; leave: number; wfh: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { present: 0, late: 0, leave: 0, wfh: 0 }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('attendance')
    .select('status')
    .eq('employee_id', user.id)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)

  const rows = data ?? []
  return {
    present: rows.filter((r) => r.status === 'present').length,
    late:    rows.filter((r) => r.status === 'late').length,
    leave:   rows.filter((r) => r.status === 'leave').length,
    wfh:     rows.filter((r) => r.status === 'wfh').length,
  }
}

export async function getAttendanceHistory(
  year: number,
  month: number  // 0-indexed
): Promise<Attendance[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = new Date(year, month, 1).toISOString().split('T')[0]
  const endDate   = new Date(year, month + 1, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  return data ?? []
}

// ── Leave Requests ────────────────────────────────────────────────────────────────

export async function getMyLeaveRequests(): Promise<LeaveRequest[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

// ── WFH Requests ──────────────────────────────────────────────────────────────────

export async function getMyWFHRequests(): Promise<WFHRequest[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('wfh_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

// ── Correction Requests ────────────────────────────────────────────────────────────

export async function getMyCorrectionRequests(): Promise<CorrectionRequest[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('correction_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

// ── Notifications ──────────────────────────────────────────────────────────────────

export async function getMyNotifications(): Promise<Notification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
}

// ── Company Settings (read-only for employees) ─────────────────────────────────────

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('company_settings')
    .select('*')
    .single()
  return data
}
