import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/utils/notify'
import { writeAuditLog } from '@/lib/utils/audit'
import { sendNotificationEmail } from '@/lib/email/send-notification'
import { calcWorkingHours } from '@/lib/utils/time'

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
      .from('profiles').select('role').eq('id', user.id).single()
    if (caller?.role !== 'admin') return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const { action, reason } = await request.json()
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ data: null, error: 'Invalid action.' }, { status: 400 })
    }
    if (action === 'rejected' && !reason?.trim()) {
      return NextResponse.json({ data: null, error: 'Rejection reason is required.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: req } = await adminClient
      .from('correction_requests')
      .select('*, profiles(full_name, email)')
      .eq('id', id)
      .single()

    if (!req) return NextResponse.json({ data: null, error: 'Request not found.' }, { status: 404 })

    const { data, error } = await adminClient
      .from('correction_requests')
      .update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select().single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })

    if (action === 'approved') {
      const { data: existing } = await adminClient
        .from('attendance')
        .select('*')
        .eq('employee_id', req.employee_id)
        .eq('date', req.date)
        .maybeSingle()

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (req.requested_check_in) updates.check_in = `${req.date}T${req.requested_check_in}`
      if (req.requested_check_out) updates.check_out = `${req.date}T${req.requested_check_out}`

      if (updates.check_in && updates.check_out) {
        updates.working_hours = calcWorkingHours(
          updates.check_in as string,
          updates.check_out as string
        )
      }

      if (existing) {
        await adminClient.from('attendance').update(updates).eq('id', existing.id)

        await writeAuditLog({
          targetType: 'attendance',
          targetId: existing.id,
          employeeId: req.employee_id,
          changedBy: user.id,
          previousValue: { check_in: existing.check_in, check_out: existing.check_out },
          newValue: { check_in: updates.check_in, check_out: updates.check_out },
          reason: `Correction request approved: ${req.reason}`,
        })
      } else {
        const { data: created } = await adminClient.from('attendance').insert({
          employee_id: req.employee_id,
          date: req.date,
          type: 'office',
          status: 'present',
          ...updates,
        }).select().single()

        if (created) {
          await writeAuditLog({
            targetType: 'attendance',
            targetId: created.id,
            employeeId: req.employee_id,
            changedBy: user.id,
            previousValue: { check_in: null, check_out: null },
            newValue: { check_in: updates.check_in, check_out: updates.check_out },
            reason: `Correction request approved: ${req.reason}`,
          })
        }
      }
    }

    const isApproved = action === 'approved'
    await createNotification({
      userId: req.employee_id,
      title: isApproved ? 'Correction Request Approved' : 'Correction Request Rejected',
      message: isApproved
        ? `Your attendance correction for ${req.date} has been updated.`
        : `Your correction request for ${req.date} was not approved. ${reason ?? ''}`,
      type: 'correction',
    })

    await sendNotificationEmail(
      req.profiles.email,
      isApproved ? 'Correction Approved' : 'Correction Rejected',
      isApproved ? 'Attendance Correction Approved' : 'Attendance Correction Rejected',
      isApproved
        ? `Your correction for ${req.date} has been applied.`
        : `Your correction for ${req.date} was not approved.`
    )

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
