import { NextRequest, NextResponse, after } from 'next/server'
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
      .from('correction_requests')
      .select('*, profile:profiles!correction_requests_employee_id_fkey(full_name, email)')
      .eq('id', id)
      .maybeSingle()

    if (!req) return NextResponse.json({ data: null, error: 'Request not found.' }, { status: 404 })

    const { data, error } = await adminClient
      .from('correction_requests')
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
      if (!req.requested_check_in && !req.requested_check_out) {
        return NextResponse.json(
          { data: null, error: 'At least one of check-in or check-out time must be provided.' },
          { status: 400 }
        )
      }

      const { data: existing } = await adminClient
        .from('attendance')
        .select('*')
        .eq('employee_id', req.employee_id)
        .eq('date', req.date)
        .maybeSingle()

      if (!existing && !req.requested_check_in && req.requested_check_out) {
        return NextResponse.json(
          { data: null, error: 'Cannot apply check-out correction without a check-in time.' },
          { status: 400 }
        )
      }

      function toISTTimestamp(date: string, time: string | null): string | null {
        if (!time) return null
        const normalized = time.length === 5 ? `${time}:00` : time
        return `${date}T${normalized}+05:30`
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      const newCheckIn = toISTTimestamp(req.date, req.requested_check_in)
      const newCheckOut = toISTTimestamp(req.date, req.requested_check_out)

      if (newCheckIn) updates.check_in = newCheckIn
      if (newCheckOut) updates.check_out = newCheckOut

      const effectiveCheckIn = updates.check_in ?? existing?.check_in
      const effectiveCheckOut = updates.check_out ?? existing?.check_out

      if (effectiveCheckIn && effectiveCheckOut) {
        updates.working_hours = calcWorkingHours(
          effectiveCheckIn as string,
          effectiveCheckOut as string
        )
      }

      if (existing) {
        const { error: mutationError } = await adminClient.from('attendance').update(updates).eq('id', existing.id)
        if (mutationError) {
          console.error('[context] mutation failed:', mutationError)
          return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
        }

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
        const { data: created, error: mutationError } = await adminClient.from('attendance').insert({
          employee_id: req.employee_id,
          date: req.date,
          type: 'office',
          status: 'present',
          ...updates,
        }).select().maybeSingle()

        if (mutationError) {
          console.error('[context] mutation failed:', mutationError)
          return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
        }

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

    after(() => {
      sendNotificationEmail(
        req.profile.email,
        isApproved ? 'Correction Approved' : 'Correction Rejected',
        isApproved ? 'Attendance Correction Approved' : 'Attendance Correction Rejected',
        isApproved
          ? `Your correction for ${req.date} has been applied.`
          : `Your correction for ${req.date} was not approved.`
      ).catch((err) => console.error('[correction email]', err))
    })

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
