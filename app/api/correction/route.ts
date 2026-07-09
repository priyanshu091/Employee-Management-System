import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const isAdminQuery = url.searchParams.get('admin') === 'true'
    const statusFilter = url.searchParams.get('status')

    if (isAdminQuery) {
      const { data: caller } = await supabase
        .from('profiles').select('role').eq('id', user.id).maybeSingle()
      
      if (caller?.role !== 'admin') {
        return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
      }

      let query = supabase
        .from('correction_requests')
        .select('*, profile:profiles!correction_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      return NextResponse.json({ data, error: null })
    }

    const { data, error } = await supabase
      .from('correction_requests')
      .select('*')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/correction] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, employee_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, reason, requested_check_in, requested_check_out } = body

    if (!date || !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Date and reason are required.' }, { status: 400 })
    }

    const { data, error: insertError } = await supabase
      .from('correction_requests')
      .insert({
        employee_id: profile.id,
        date,
        reason: reason.trim(),
        requested_check_in: requested_check_in || null,
        requested_check_out: requested_check_out || null,
        status: 'pending',
      })
      .select()
      .maybeSingle()

    if (insertError) {
      console.error('[POST /api/correction] Insert error:', insertError)
      return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/correction] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
