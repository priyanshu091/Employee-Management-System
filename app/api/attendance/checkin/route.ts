import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLate, getTodayIST } from '@/lib/utils/time'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }

    const { type, late_reason } = await request.json()

    if (!type || !['office', 'wfh'].includes(type)) {
      return NextResponse.json({ data: null, error: 'Invalid type.' }, { status: 400 })
    }

    const today = getTodayIST()

    // Check duplicate
    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', profile.id)
      .eq('date', today)
      .maybeSingle()

    if (existingError) {
      console.error('[POST /api/attendance/checkin] Fetch existing error:', existingError)
      return NextResponse.json({ data: null, error: existingError.message }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Already checked in today.' },
        { status: 409 }
      )
    }

    // Get company settings for late check
    const { data: settings, error: settingsError } = await supabase
      .from('company_settings')
      .select('office_start_time, grace_period_minutes, attendance_lock_time')
      .maybeSingle()

    if (settingsError) {
      console.error('[POST /api/attendance/checkin] Settings error:', settingsError)
    }

    const now = new Date()

    // Check attendance lock
    if (settings?.attendance_lock_time) {
      const [lh, lm] = settings.attendance_lock_time.split(':').map(Number)
      const lockTime = new Date(now)
      lockTime.setHours(lh, lm, 0, 0)
      if (now > lockTime) {
        return NextResponse.json(
          { data: null, error: 'Attendance is locked for today. Submit a correction request.' },
          { status: 403 }
        )
      }
    }

    // Determine status
    let status: 'present' | 'late' | 'wfh' = type === 'wfh' ? 'wfh' : 'present'

    if (type === 'office' && settings) {
      const late = isLate(now, settings.office_start_time, settings.grace_period_minutes)
      if (late) status = 'late'
    }

    // Insert attendance record
    const { data, error: insertError } = await supabase
      .from('attendance')
      .insert({
        employee_id: profile.id,
        date: today,
        check_in: now.toISOString(),
        type,
        status,
        late_reason: late_reason || null,
      })
      .select()
      .maybeSingle()

    if (insertError) {
      console.error('[POST /api/attendance/checkin] Insert error:', insertError)
      return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { data: null, error: 'Failed to create attendance record.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/attendance/checkin] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
