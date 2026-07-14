import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTodayIST, getNowIST, isLate } from '@/lib/utils/time'
import { haversineKm } from '@/lib/utils/geo'

interface QrValidateBody {
  token?: string;
  lat?: number;
  lng?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Always verify session first
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

    const secret = process.env.QR_CHECKIN_SECRET
    if (!secret) {
      return NextResponse.json({ data: null, error: 'QR not configured' }, { status: 500 })
    }

    const body = (await request.json()) as QrValidateBody
    if (!body.token) {
      return NextResponse.json({ data: null, error: 'Token required' }, { status: 400 })
    }
    if (body.token !== secret) {
      return NextResponse.json({ data: null, error: 'Invalid QR code' }, { status: 400 })
    }

    if (body.lat === undefined || body.lng === undefined) {
      return NextResponse.json({ data: null, error: 'Location access required for QR check-in' }, { status: 400 })
    }

    const today = getTodayIST()
    const now = getNowIST()

    // Check attendance status
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', profile.id)
      .eq('date', today)
      .maybeSingle()

    if (existing && existing.check_out) {
      return NextResponse.json({ data: null, error: 'You have already completed your attendance for today.' }, { status: 400 })
    }

    // Determine check-in or check-out
    if (!existing) {
      // CHECK-IN
      const { data: settings } = await supabase
        .from('company_settings')
        .select('office_lat, office_lng, allowed_radius_km, office_start_time, grace_period_minutes, attendance_lock_time')
        .maybeSingle()

      if (settings) {
        const distance = haversineKm(body.lat, body.lng, Number(settings.office_lat), Number(settings.office_lng))
        if (distance > Number(settings.allowed_radius_km)) {
          return NextResponse.json({ data: null, error: 'You are too far from the office to check in.' }, { status: 403 })
        }

        if (settings.attendance_lock_time) {
          const [lh, lm] = settings.attendance_lock_time.split(':').map(Number)
          const lockTime = getNowIST()
          lockTime.setHours(lh, lm, 0, 0)
          if (now > lockTime) {
            return NextResponse.json({ data: null, error: 'Attendance is locked for today. Submit a correction request.' }, { status: 403 })
          }
        }
      }

      let status: 'present' | 'late' = 'present'
      if (settings) {
        const late = isLate(new Date(), settings.office_start_time, settings.grace_period_minutes)
        if (late) status = 'late'
      }

      const { error: insertError } = await supabase.from('attendance').insert({
        employee_id: profile.id,
        date: today,
        check_in: new Date().toISOString(),
        type: 'office',
        status,
      })

      if (insertError) {
        return NextResponse.json({ data: null, error: 'Failed to create attendance record.' }, { status: 500 })
      }
      return NextResponse.json({ data: { action: 'checkin', status }, error: null }, { status: 200 })
    } else {
      // CHECK-OUT
      if (!existing.check_in) {
        return NextResponse.json({ data: null, error: `Cannot check out. Your current status is: ${existing.status}` }, { status: 400 })
      }
      const checkOutTime = new Date() // standard UTC to compare with check_in
      const checkInTime = new Date(existing.check_in)
      const workingHours = Math.round(((checkOutTime.getTime() - checkInTime.getTime()) / 1000 / 60 / 60) * 100) / 100

      const adminClient = createAdminClient()
      const { error: updateError } = await adminClient.from('attendance').update({
        check_out: new Date().toISOString(),
        working_hours: workingHours,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)

      if (updateError) {
        return NextResponse.json({ data: null, error: 'Failed to update attendance record.' }, { status: 500 })
      }
      return NextResponse.json({ data: { action: 'checkout', status: existing.status }, error: null }, { status: 200 })
    }
  } catch (err) {
    console.error('[API Error]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
