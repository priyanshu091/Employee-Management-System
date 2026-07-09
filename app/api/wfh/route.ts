import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const isAdminQuery = url.searchParams.get('admin') === 'true'
    const statusFilter = url.searchParams.get('status')

    if (isAdminQuery) {
      const { data: caller } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (caller?.role !== 'admin') {
        return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
      }

      let query = supabase
        .from('wfh_requests')
        .select('*, profiles(full_name, employee_id, avatar_url)')
        .order('created_at', { ascending: false })
      if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter)

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
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { date, reason } = await request.json()

    if (!date || !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Date and reason are required.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wfh_requests')
      .insert({ employee_id: user.id, date, reason: reason.trim(), status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
