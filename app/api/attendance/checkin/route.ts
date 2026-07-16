import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLate, getTodayIST, getNowIST } from '@/lib/utils/time'
import { haversineKm } from '@/lib/utils/geo'
import { sendNotificationEmail } from '@/lib/email/send-notification'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }

    const { type, late_reason, lat, lng } = await request.json()

    if (!type || !['office', 'wfh'].includes(type)) {
      return NextResponse.json({ data: null, error: 'Invalid type.' }, { status: 400 })
    }

    if (type === 'wfh') {
      return NextResponse.json({ data: null, error: 'WFH must be requested via /api/wfh' }, { status: 400 })
    }

    if (type === 'office' && (lat === undefined || lng === undefined)) {
      return NextResponse.json({ data: null, error: 'Location is required for office check-in' }, { status: 400 })
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

    // Get company settings for late check and GPS validation
    const { data: settings, error: settingsError } = await supabase
      .from('company_settings')
      .select('office_lat, office_lng, allowed_radius_km, office_start_time, grace_period_minutes, attendance_lock_time')
      .maybeSingle()

    if (settingsError) {
      console.error('[POST /api/attendance/checkin] Settings error:', settingsError)
    }

    if (type === 'office' && settings) {
      const distance = haversineKm(lat, lng, Number(settings.office_lat), Number(settings.office_lng))
      if (distance > Number(settings.allowed_radius_km)) {
        return NextResponse.json(
          { data: null, error: 'You are too far from the office to check in.' },
          { status: 403 }
        )
      }
    }

    const now = getNowIST()

    // Check attendance lock
    if (settings?.attendance_lock_time) {
      const nowTotalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
      const [lh, lm] = settings.attendance_lock_time.split(':').map(Number)
      const lockTotalMinutes = lh * 60 + lm
      
      if (nowTotalMinutes > lockTotalMinutes) {
        return NextResponse.json(
          { data: null, error: 'Attendance is locked for today. Submit a correction request.' },
          { status: 403 }
        )
      }
    }

    // Determine status
    let status: 'present' | 'late' | 'wfh' = type === 'wfh' ? 'wfh' : 'present'

    if (type === 'office' && settings) {
      const late = isLate(new Date(), settings.office_start_time, settings.grace_period_minutes)
      if (late) status = 'late'
    }

    // Insert attendance record
    const { data, error: insertError } = await supabase
      .from('attendance')
      .insert({
        employee_id: profile.id,
        date: today,
        check_in: new Date().toISOString(),
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

    // Send email to admin
    try {
      const { data: admin } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')
        .limit(1)
        .single()
        
      if (admin?.email) {
        const checkInTimeStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
        await sendNotificationEmail(
          admin.email,
          `Check-in Alert: ${profile.full_name}`,
          'Employee Check-in',
          `Employee ${profile.full_name} checked in at ${checkInTimeStr}.`
        )
      }
    } catch (emailErr) {
      console.error('[POST /api/attendance/checkin] Failed to send admin email:', emailErr)
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/attendance/checkin] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
