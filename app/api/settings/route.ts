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
      .from('company_settings').select('*').single()
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
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
      .from('profiles').select('role').eq('id', user.id).single()
    if (caller?.role !== 'admin') return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    const { data: existing } = await supabase
      .from('company_settings').select('id').single()

    if (!existing) {
      return NextResponse.json({ data: null, error: 'Settings row not found.' }, { status: 404 })
    }

    const safe: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in body) safe[key] = body[key]
    }

    const { data, error } = await supabase
      .from('company_settings')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select().single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
