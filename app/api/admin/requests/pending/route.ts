import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const [
      { data: profile },
      { data: leave },
      { data: wfh },
      { data: correction }
    ] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase
        .from('leave_requests')
        .select('*, profile:profiles!leave_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('wfh_requests')
        .select('*, profile:profiles!wfh_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('correction_requests')
        .select('*, profile:profiles(full_name, employee_id, avatar_url)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    ])

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      data: {
        leave: leave ?? [],
        wfh: wfh ?? [],
        correction: correction ?? []
      },
      error: null
    })
  } catch (err) {
    console.error('[admin-pending-requests]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
