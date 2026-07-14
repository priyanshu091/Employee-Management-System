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

    // Location access is no longer required during initial validation

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

    if (!existing) {
      return NextResponse.json({ data: { action: 'checkin' }, error: null }, { status: 200 })
    } else {
      if (!existing.check_in) {
        return NextResponse.json({ data: null, error: `Cannot check out. Your current status is: ${existing.status}` }, { status: 400 })
      }
      return NextResponse.json({ data: { action: 'checkout', status: existing.status }, error: null }, { status: 200 })
    }
  } catch (err) {
    console.error('[API Error]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
