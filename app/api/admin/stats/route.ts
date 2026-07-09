import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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

    const today = new Date().toISOString().split('T')[0]

    const [
      { count: totalEmployees },
      { data: todayAttendance },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('role', 'employee'),
      supabase.from('attendance').select('status, employee_id').eq('date', today),
    ])

    const rows = todayAttendance ?? []
    const stats = {
      totalEmployees: totalEmployees ?? 0,
      present: rows.filter((r) => r.status === 'present').length,
      absent: Math.max((totalEmployees ?? 0) - rows.length, 0),
      late: rows.filter((r) => r.status === 'late').length,
      wfh: rows.filter((r) => r.status === 'wfh').length,
      onLeave: rows.filter((r) => r.status === 'leave').length,
    }

    // Who's in office (checked in, not checked out)
    const { data: inOffice } = await supabase
      .from('attendance')
      .select('employee_id, check_in, profiles(full_name, department)')
      .eq('date', today)
      .eq('type', 'office')
      .not('check_in', 'is', null)
      .is('check_out', null)

    return NextResponse.json({ data: { stats, inOffice: inOffice ?? [] }, error: null })
  } catch (err) {
    console.error('[admin-stats]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
