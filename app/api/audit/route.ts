import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (!caller) return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    if (caller.role !== 'admin') return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const url = new URL(request.url)
    const emp = url.searchParams.get('employee')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const adminClient = createAdminClient()
    let query = adminClient
      .from('audit_logs')
      .select(`
        *,
        affected:employee_id(full_name, employee_id),
        changer:changed_by(full_name)
      `)
      .order('created_at', { ascending: false })

    if (emp && emp !== 'all') query = query.eq('employee_id', emp)
    if (from) query = query.gte('created_at', `${from}T00:00:00`)
    if (to) query = query.lte('created_at', `${to}T23:59:59`)

    const { data, error } = await query
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
