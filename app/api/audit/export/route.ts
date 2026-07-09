import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/utils/audit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { type, format, label } = await request.json()

    if (!type || !format || !label) {
      return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 })
    }

    await writeAuditLog({
      targetType: 'report_export',
      targetId: user.id,
      employeeId: user.id,
      changedBy: user.id,
      previousValue: {},
      newValue: { type, format, label },
      reason: `Exported ${format} report: ${label}`,
    })

    return NextResponse.json({ data: 'ok', error: null })
  } catch (err) {
    console.error('[POST /api/audit/export] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
