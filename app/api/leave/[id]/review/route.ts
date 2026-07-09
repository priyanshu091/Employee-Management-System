import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/utils/notify'
import { sendNotificationEmail } from '@/lib/email/send-notification'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (!caller) return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
    if (caller?.role !== 'admin') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
    }

    const { action, reason } = await request.json()
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ data: null, error: 'Invalid action.' }, { status: 400 })
    }
    if (action === 'rejected' && !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Rejection reason is required.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: req } = await adminClient
      .from('leave_requests')
      .select('*, profile:profiles!leave_requests_employee_id_fkey(full_name, email)')
      .eq('id', id)
      .maybeSingle()

    if (!req) return NextResponse.json({ data: null, error: 'Request not found.' }, { status: 404 })

    const { data, error } = await adminClient
      .from('leave_requests')
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

    if (action === 'approved') {
      const start = new Date(req.start_date)
      const end = new Date(req.end_date)
      const dates: string[] = []

      const { data: holidays } = await adminClient.from('holidays').select('date')
      const holidayDates = new Set(holidays?.map(h => h.date) ?? [])

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const dayOfWeek = d.getDay()

        if (dayOfWeek === 0 || dayOfWeek === 6) continue
        if (holidayDates.has(dateStr)) continue

        dates.push(dateStr)
      }

      for (const date of dates) {
        const { error: mutationError } = await adminClient.from('attendance').upsert({
          employee_id: req.employee_id,
          date,
          type: 'office',
          status: 'leave',
        }, { onConflict: 'employee_id,date' })

        if (mutationError) {
          console.error('[leave review] mutation failed:', mutationError)
          return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
        }
      }
    }

    const isApproved = action === 'approved'
    await createNotification({
      userId: req.employee_id,
      title: isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
      message: isApproved
        ? `Your ${req.leave_type} for ${req.start_date} to ${req.end_date} has been approved.`
        : `Your ${req.leave_type} for ${req.start_date} to ${req.end_date} was not approved. ${reason ?? ''}`,
      type: 'leave',
    })

    await sendNotificationEmail(
      req.profile.email,
      isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
      isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
      isApproved
        ? `Your ${req.leave_type} request has been approved.`
        : `Your ${req.leave_type} request was not approved. ${reason ?? ''}`
    )

    return NextResponse.json({ data, error: null })
  } catch (err) {
    console.error('[leave review]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
