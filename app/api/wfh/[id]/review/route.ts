import { NextRequest, NextResponse, after } from 'next/server'
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
    if (caller.role !== 'admin') return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const { action, reason } = await request.json()
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ data: null, error: 'Invalid action.' }, { status: 400 })
    }
    if (action === 'rejected' && !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Rejection reason is required.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: req } = await adminClient
      .from('wfh_requests')
      .select('*, profile:profiles!wfh_requests_employee_id_fkey(full_name, email)')
      .eq('id', id)
      .maybeSingle()

    if (!req) return NextResponse.json({ data: null, error: 'Request not found.' }, { status: 404 })

    const { data, error } = await adminClient
      .from('wfh_requests')
      .update({ 
        status: action, 
        reviewed_by: user.id, 
        reviewed_at: new Date().toISOString(),
        ...(action === 'rejected' && reason ? { reason: req.reason + '. Admin rejection reason: ' + reason } : {})
      })
      .eq('id', id)
      .select().maybeSingle()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

    if (action === 'approved') {
      const { error: mutationError } = await adminClient.from('attendance').upsert({
        employee_id: req.employee_id,
        date: req.date,
        type: 'wfh',
        status: 'wfh',
      }, { onConflict: 'employee_id,date' })

      if (mutationError) {
        console.error('[wfh review] mutation failed:', mutationError)
        return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
      }
    }

    const isApproved = action === 'approved'
    await createNotification({
      userId: req.employee_id,
      title: isApproved ? 'WFH Request Approved' : 'WFH Request Rejected',
      message: isApproved
        ? `Your WFH request for ${req.date} has been approved.`
        : `Your WFH request for ${req.date} was not approved. ${reason ?? ''}`,
      type: 'wfh',
    })

    after(() => {
      sendNotificationEmail(
        req.profile.email,
        isApproved ? 'WFH Request Approved' : 'WFH Request Rejected',
        isApproved ? 'WFH Request Approved' : 'WFH Request Rejected',
        isApproved ? `Your WFH for ${req.date} is approved.` : `Your WFH for ${req.date} was not approved.`
      ).catch((err) => console.error('[wfh email]', err))
    })

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
