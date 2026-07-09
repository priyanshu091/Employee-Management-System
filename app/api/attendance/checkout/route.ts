import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTodayIST } from '@/lib/utils/time'

export async function POST(request: NextRequest) {
  try {
    // 1. Always await createClient()
    const supabase = await createClient()

    // 2. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Get profile using .maybeSingle() NOT .single()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    }

    // 4. Get today's date in YYYY-MM-DD format
    const today = getTodayIST()

    // 5. Find today's attendance record using .maybeSingle() NOT .single()
    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', profile.id)
      .eq('date', today)
      .maybeSingle()

    // 6. If no check-in record found, return clear error
    if (fetchError) {
      console.error('[POST /api/attendance/checkout] Fetch error:', fetchError)
      return NextResponse.json({ data: null, error: fetchError.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json(
        { data: null, error: 'No check-in record found for today. Please check in first.' },
        { status: 400 }
      )
    }

    // 7. If already checked out, return clear error
    if (existing.check_out) {
      return NextResponse.json(
        { data: null, error: 'You have already checked out today.' },
        { status: 400 }
      )
    }

    // 8. Calculate working hours
    const checkOutTime = new Date()
    const checkInTime = new Date(existing.check_in)
    const workingHours = Math.round(
      ((checkOutTime.getTime() - checkInTime.getTime()) / 1000 / 60 / 60) * 100
    ) / 100

    // 9. Update the attendance record
    // Use .eq filters BEFORE .select().maybeSingle()
    const { data: updated, error: updateError } = await supabase
      .from('attendance')
      .update({
        check_out: checkOutTime.toISOString(),
        working_hours: workingHours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('[POST /api/attendance/checkout] Update error:', updateError)
      return NextResponse.json({ data: null, error: updateError.message }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json(
        { data: null, error: 'Failed to update attendance record.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updated, error: null }, { status: 200 })

  } catch (err) {
    console.error('[POST /api/attendance/checkout] Unexpected error:', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
