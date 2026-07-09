import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/utils/audit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()

    if (!caller) return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })

    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const empId = url.searchParams.get('employee')
    const status = url.searchParams.get('status')
    const isAdmin = caller?.role === 'admin'

    let query = supabase
      .from('attendance')
      .select('*, profile:profiles(full_name, employee_id, department)')
      .order('date', { ascending: false })

    if (!isAdmin) {
      query = query.eq('employee_id', user.id)
    } else if (empId && empId !== 'all') {
      query = query.eq('employee_id', empId)
    }

    if (month && month !== 'all') {
      const [y, m] = month.split('-')
      const start = `${y}-${m}-01`
      const end = new Date(Number(y), Number(m), 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    }

    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()

    if (!caller) return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    if (caller?.role !== 'admin') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { id, check_in, check_out, reason } = await request.json()

    if (!id || !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Record ID and reason are required.' }, { status: 400 })
    }

    const { data: current } = await supabase
      .from('attendance').select('*').eq('id', id).maybeSingle()

    if (!current) {
      return NextResponse.json({ data: null, error: 'Record not found.' }, { status: 404 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (check_in !== undefined) updates.check_in = check_in || null
    if (check_out !== undefined) updates.check_out = check_out || null

    if (updates.check_in && updates.check_out) {
      const ms = new Date(updates.check_out as string).getTime() - new Date(updates.check_in as string).getTime()
      updates.working_hours = Math.round((ms / 1000 / 60 / 60) * 100) / 100
    }

    // FIX 1: was .single() — replaced with .maybeSingle()
    const { data: updated, error } = await supabase
      .from('attendance').update(updates).eq('id', id).select().maybeSingle()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

    if (!updated) {
      return NextResponse.json(
        { data: null, error: 'Attendance record not found or update failed.' },
        { status: 404 }
      )
    }

    await writeAuditLog({
      targetType: 'attendance',
      targetId: id,
      employeeId: current.employee_id,
      changedBy: user.id,
      previousValue: { check_in: current.check_in, check_out: current.check_out, status: current.status },
      newValue: { check_in: updates.check_in, check_out: updates.check_out },
      reason: reason.trim(),
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
