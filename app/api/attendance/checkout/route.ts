import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcWorkingHours } from '@/lib/utils/time'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get today's attendance record
    const { data: record, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', user.id)
      .eq('date', today)
      .maybeSingle()

    if (fetchError || !record) {
      return NextResponse.json(
        { data: null, error: 'No check-in found for today.' },
        { status: 404 }
      )
    }

    if (record.check_out) {
      return NextResponse.json(
        { data: null, error: 'Already checked out today.' },
        { status: 409 }
      )
    }

    const now = new Date()
    const workingHours = calcWorkingHours(record.check_in, now.toISOString())

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString(),
        working_hours: workingHours,
        updated_at: now.toISOString(),
      })
      .eq('id', record.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 200 })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
