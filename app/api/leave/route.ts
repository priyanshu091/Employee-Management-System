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
        .from('leave_requests')
        .select('*, profile:profiles!leave_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
      return NextResponse.json({ data, error: null })
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[GET /api/leave] Unexpected error:', err)
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
    const { leave_type, start_date, end_date, reason } = body

    if (!leave_type || !start_date || !end_date || !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'All fields are required.' }, { status: 400 })
    }

    if (end_date < start_date) {
      return NextResponse.json({ data: null, error: 'End date must be after start date.' }, { status: 400 })
    }

    const { data: overlapping } = await supabase
      .from('leave_requests')
      .select('id')
      .eq('employee_id', profile.id)
      .in('status', ['pending', 'approved'])
      .lte('start_date', end_date)
      .gte('end_date', start_date)
      .limit(1)

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { data: null, error: 'A leave request already exists that overlaps with these dates.' },
        { status: 409 }
      )
    }

    const { data, error: insertError } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: profile.id,
        leave_type,
        start_date,
        end_date,
        reason: reason.trim(),
        status: 'pending',
      })
      .select()
      .maybeSingle()

    if (insertError) {
      console.error('[POST /api/leave] Insert error:', insertError)
      return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/leave] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
