import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = [
  'company_name', 'office_address', 'office_lat', 'office_lng',
  'allowed_radius_km', 'office_start_time', 'office_end_time',
  'grace_period_minutes', 'attendance_lock_time', 'logo_url',
] as const

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('company_settings').select('*').maybeSingle()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

    if (!data) {
      return NextResponse.json({
        data: {
          company_name: 'My Company',
          office_address: '',
          office_lat: 0,
          office_lng: 0,
          allowed_radius_km: 1.0,
          office_start_time: '10:00',
          office_end_time: '19:00',
          grace_period_minutes: 10,
          attendance_lock_time: '23:59',
          logo_url: null,
        },
        error: null
      }, { status: 200 })
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (!caller) return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    if (caller.role !== 'admin') return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    const { data: existing } = await supabase
      .from('company_settings').select('id').maybeSingle()

    const safe: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) safe[key] = body[key]
    }

    // Validate office coordinates if being updated
    if ('office_lat' in safe || 'office_lng' in safe) {
      const lat = safe.office_lat as number ?? 0
      const lng = safe.office_lng as number ?? 0

      if (lat === 0 && lng === 0) {
        return NextResponse.json(
          { data: null, error: 'Please set valid office coordinates. Latitude and longitude cannot both be 0.' },
          { status: 400 }
        )
      }

      if (lat < -90 || lat > 90) {
        return NextResponse.json(
          { data: null, error: 'Invalid latitude. Must be between -90 and 90.' },
          { status: 400 }
        )
      }

      if (lng < -180 || lng > 180) {
        return NextResponse.json(
          { data: null, error: 'Invalid longitude. Must be between -180 and 180.' },
          { status: 400 }
        )
      }
    }

    if (!existing) {
      // No row exists — insert with defaults for required fields
      const { data, error } = await supabase
        .from('company_settings')
        .insert({
          company_name: 'My Company',
          office_address: '',
          office_lat: 0,
          office_lng: 0,
          allowed_radius_km: 1.0,
          office_start_time: '10:00',
          office_end_time: '19:00',
          grace_period_minutes: 10,
          attendance_lock_time: '23:59',
          ...safe,
        })
        .select()
        .single()
      
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      return NextResponse.json({ data, error: null }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('company_settings')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select().maybeSingle()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
