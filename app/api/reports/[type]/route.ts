import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function formatTime(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProfile(p: any) {
  if (Array.isArray(p)) return p[0]
  return p
}

function formatHours(hours: number | null): string {
  if (!hours) return '--'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }
    if (profile.role !== 'admin') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)

    // ── daily ────────────────────────────────────────────────────────────────
    if (type === 'daily') {
      const date = url.searchParams.get('date')
      if (!date) {
        return NextResponse.json({ data: null, error: 'date param required (YYYY-MM-DD)' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('*, profile:profiles(full_name, employee_id, department)')
        .eq('date', date)
        .order('created_at', { ascending: true })

      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      const rows = (data ?? []).map((r) => {
        const p = getProfile(r.profile)
        return {
          employee_name: p?.full_name ?? 'Unknown',
          employee_id: p?.employee_id ?? '--',
          department: p?.department ?? '--',
          date: r.date,
          check_in: formatTime(r.check_in),
          check_out: formatTime(r.check_out),
          working_hours: formatHours(r.working_hours),
          status: r.status,
          type: r.type,
        }
      })

      return NextResponse.json({ data: rows, error: null })
    }

    // ── monthly ───────────────────────────────────────────────────────────────
    if (type === 'monthly') {
      const month = Number(url.searchParams.get('month') ?? new Date().getMonth() + 1)
      const year = Number(url.searchParams.get('year') ?? new Date().getFullYear())
      const department = url.searchParams.get('department')

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`

      const { data, error } = await supabase
        .from('attendance')
        .select('*, profile:profiles(full_name, employee_id, department)')
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      // Group by employee
      const byEmployee = new Map<string, {
        employee_name: string
        employee_id: string
        department: string
        present_days: number
        late_days: number
        wfh_days: number
        leave_days: number
        total_working_hours: number
      }>()

      for (const r of data ?? []) {
        const prof = getProfile(r.profile)
        if (!prof) continue
        if (department && department !== 'All Departments' && prof.department !== department) continue

        const key = r.employee_id
        if (!byEmployee.has(key)) {
          byEmployee.set(key, {
            employee_name: prof.full_name,
            employee_id: prof.employee_id,
            department: prof.department ?? '--',
            present_days: 0,
            late_days: 0,
            wfh_days: 0,
            leave_days: 0,
            total_working_hours: 0,
          })
        }
        const row = byEmployee.get(key)!
        if (r.status === 'present') row.present_days++
        if (r.status === 'late') { row.late_days++; row.present_days++ }
        if (r.status === 'wfh') row.wfh_days++
        if (r.status === 'leave') row.leave_days++
        if (r.working_hours) row.total_working_hours += Number(r.working_hours)
      }

      const rows = Array.from(byEmployee.values()).map((r) => ({
        ...r,
        total_working_hours: formatHours(r.total_working_hours),
      }))

      return NextResponse.json({ data: rows, error: null })
    }

    // ── employee ──────────────────────────────────────────────────────────────
    if (type === 'employee') {
      const employeeId = url.searchParams.get('employee_id')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      if (!startDate || !endDate) {
        return NextResponse.json(
          { data: null, error: 'start_date and end_date params required' },
          { status: 400 }
        )
      }

      let query = supabase
        .from('attendance')
        .select('*, profile:profiles(full_name, employee_id, department)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (employeeId && employeeId !== 'all') {
        query = query.eq('employee_id', employeeId)
      }

      const { data, error } = await query

      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      const rows = (data ?? []).map((r) => {
        const p = getProfile(r.profile)
        return {
          employee_name: p?.full_name ?? 'Unknown',
          employee_id: p?.employee_id ?? '--',
          department: p?.department ?? '--',
          date: r.date,
          check_in: formatTime(r.check_in),
          check_out: formatTime(r.check_out),
          working_hours: formatHours(r.working_hours),
          status: r.status,
          type: r.type,
        }
      })

      return NextResponse.json({ data: rows, error: null })
    }

    // ── leave ─────────────────────────────────────────────────────────────────
    if (type === 'leave') {
      const employeeId = url.searchParams.get('employee_id')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      if (!startDate || !endDate) {
        return NextResponse.json(
          { data: null, error: 'start_date and end_date params required' },
          { status: 400 }
        )
      }

      let query = supabase
        .from('leave_requests')
        .select('*, profile:profiles!leave_requests_employee_id_fkey(full_name, employee_id, department)')
        .gte('start_date', startDate)
        .lte('end_date', endDate)
        .order('created_at', { ascending: false })

      if (employeeId && employeeId !== 'all') {
        query = query.eq('employee_id', employeeId)
      }

      const { data, error } = await query
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      const rows = (data ?? []).map((r) => {
        const p = getProfile(r.profile)
        return {
          employee_name: p?.full_name ?? 'Unknown',
          employee_id: p?.employee_id ?? '--',
          leave_type: r.leave_type,
          start_date: r.start_date,
          end_date: r.end_date,
          days: daysBetween(r.start_date, r.end_date),
          reason: r.reason,
          status: r.status,
        }
      })

      return NextResponse.json({ data: rows, error: null })
    }

    // ── wfh ───────────────────────────────────────────────────────────────────
    if (type === 'wfh') {
      const employeeId = url.searchParams.get('employee_id')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      if (!startDate || !endDate) {
        return NextResponse.json(
          { data: null, error: 'start_date and end_date params required' },
          { status: 400 }
        )
      }

      let query = supabase
        .from('wfh_requests')
        .select('*, profile:profiles!wfh_requests_employee_id_fkey(full_name, employee_id, department)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('created_at', { ascending: false })

      if (employeeId && employeeId !== 'all') {
        query = query.eq('employee_id', employeeId)
      }

      const { data, error } = await query
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      const rows = (data ?? []).map((r) => {
        const p = getProfile(r.profile)
        return {
          employee_name: p?.full_name ?? 'Unknown',
          employee_id: p?.employee_id ?? '--',
          date: r.date,
          reason: r.reason,
          status: r.status,
        }
      })

      return NextResponse.json({ data: rows, error: null })
    }

    // ── late ──────────────────────────────────────────────────────────────────
    if (type === 'late') {
      const month = Number(url.searchParams.get('month') ?? new Date().getMonth() + 1)
      const year = Number(url.searchParams.get('year') ?? new Date().getFullYear())
      const department = url.searchParams.get('department')

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`

      const { data, error } = await supabase
        .from('attendance')
        .select('*, profile:profiles(full_name, employee_id, department)')
        .eq('status', 'late')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

      const rows = (data ?? [])
        .filter((r) => {
          const prof = getProfile(r.profile)
          if (department && department !== 'All Departments') {
            return prof?.department === department
          }
          return true
        })
        .map((r) => {
          const p = getProfile(r.profile)
          return {
            employee_name: p?.full_name ?? 'Unknown',
            employee_id: p?.employee_id ?? '--',
            department: p?.department ?? '--',
            date: r.date,
            check_in: formatTime(r.check_in),
            late_reason: r.late_reason ?? '--',
          }
        })

      return NextResponse.json({ data: rows, error: null })
    }

    return NextResponse.json({ data: null, error: `Unknown report type: ${type}` }, { status: 400 })
  } catch (err) {
    console.error('[reports]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
