import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTodayIST } from '@/lib/utils/time'

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
        .from('wfh_requests')
        .select('*, profile:profiles!wfh_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      return NextResponse.json({ data, error: null })
    }

    const { data, error } = await supabase
      .from('wfh_requests')
      .select('*')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/wfh] Unexpected error:', err)
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
    const { date, reason } = body

    if (!date || !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Date and reason are required.' }, { status: 400 })
    }

    const todayIST = getTodayIST()
    if (date < todayIST) {
      return NextResponse.json(
        { data: null, error: 'WFH cannot be requested for past dates. Please use a correction request.' },
        { status: 400 }
      )
    }

    const { data: existingRequest } = await supabase
      .from('wfh_requests')
      .select('id')
      .eq('employee_id', profile.id)
      .eq('date', date)
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { data: null, error: 'A WFH request already exists for this date.' },
        { status: 409 }
      )
    }

    const { data, error: insertError } = await supabase
      .from('wfh_requests')
      .insert({
        employee_id: profile.id,
        date,
        reason: reason.trim(),
        status: 'pending'
      })
      .select()
      .maybeSingle()

    if (insertError) {
      console.error('[POST /api/wfh] Insert error:', insertError)
      return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/wfh] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
