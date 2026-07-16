import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/utils/notify'
import { sendNotificationEmail } from '@/lib/email/send-notification'
import { getTodayIST, getCurrentISTTime, timeToMinutes } from '@/lib/utils/time'
import type { Profile, CompanySettings } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // 2. Read company settings
    const { data: settings, error: settingsError } = await adminClient
      .from('company_settings')
      .select('office_end_time')
      .maybeSingle()

    if (settingsError || !settings) {
      console.error('[cron] Failed to read company settings:', settingsError)
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
    }

    // 3. Get current IST time in minutes
    const { hours, minutes } = getCurrentISTTime()
    const currentMinutes = hours * 60 + minutes

    // 4. Calculate office end time in minutes
    const officeEndMinutes = timeToMinutes(settings.office_end_time)

    // 5. Check which window we are in (30-minute window)
    const inAutoCheckoutWindow =
      currentMinutes >= officeEndMinutes &&
      currentMinutes < officeEndMinutes + 30

    // 6. If not in window — exit early, do nothing
    if (!inAutoCheckoutWindow) {
      return NextResponse.json({
        message: 'No action needed at this time',
        currentIST: `${hours}:${String(minutes).padStart(2, '0')}`,
        officeEnd: settings.office_end_time,
      })
    }

    // 7. Get today's date in IST
    const today = getTodayIST()

    // 8. Find all employees who checked in today but NOT checked out
    const { data: uncheckedRows, error: fetchError } = await adminClient
      .from('attendance')
      .select(`
        id,
        employee_id,
        check_in,
        check_out,
        type,
        profile:profiles!attendance_employee_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('date', today)
      .not('check_in', 'is', null)
      .is('check_out', null)

    if (fetchError) {
      console.error('[cron] Failed to fetch unchecked rows:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!uncheckedRows || uncheckedRows.length === 0) {
      return NextResponse.json({
        message: 'All employees have checked out',
        action: 'auto-checkout',
      })
    }

    // Removed reminder window — jumping straight to auto-checkout.

    // 10. Handle AUTO-CHECKOUT window
    if (inAutoCheckoutWindow) {
      const autoCheckoutTime = new Date()
      let checkedOut = 0

      for (const row of uncheckedRows) {
        const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile
        if (!profile?.id) continue

        // Calculate working hours from actual check_in to now
        const checkInTime = new Date(row.check_in)
        const workingHours = Math.round(
          ((autoCheckoutTime.getTime() - checkInTime.getTime())
          / 1000 / 60 / 60) * 100
        ) / 100

        // Update attendance row
        const { error: updateError } = await adminClient
          .from('attendance')
          .update({
            check_out: autoCheckoutTime.toISOString(),
            working_hours: workingHours,
            late_reason: 'Auto checked out — employee did not check out manually.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id)

        if (updateError) {
          console.error(`[cron] Failed to auto-checkout row ${row.id}:`, updateError)
          continue // Don't stop — try next employee
        }

        // Create in-app notification
        await createNotification({
          userId: profile.id,
          title: 'You were automatically checked out',
          message: `You forgot to check out. You have been automatically checked out at ${autoCheckoutTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}. Your working hours: ${workingHours}h. If this is incorrect, please submit a correction request.`,
          type: 'reminder',
        })

        // Send email
        if (profile.email) {
          try {
            await sendNotificationEmail(
              profile.email,
              'You were automatically checked out',
              'Automatic Checkout',
              `Hi ${profile.full_name}, you forgot to check out today. You have been automatically checked out. Your recorded working hours are ${workingHours} hours. If this is incorrect, please submit a correction request from the app.`
            )
          } catch (emailErr) {
            console.error(`[cron] Failed to send auto-checkout email to ${profile.email}:`, emailErr)
          }
        }
        checkedOut++
      }

      return NextResponse.json({
        message: `Auto-checked out ${checkedOut} employee(s)`,
        action: 'auto-checkout',
        count: checkedOut,
      })
    }

    return NextResponse.json({ message: 'Done' })

  } catch (err) {
    console.error('[cron] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
