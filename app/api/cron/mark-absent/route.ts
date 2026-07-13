import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/utils/notify'
import { sendNotificationEmail } from '@/lib/email/send-notification'
import { getTodayIST, getCurrentISTTime, timeToMinutes } from '@/lib/utils/time'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const today = getTodayIST()

    // 2. Check if today is Sunday
    // Note: getTodayIST() returns 'YYYY-MM-DD'. Let's parse it securely.
    const dateObj = new Date(today)
    if (dateObj.getDay() === 0) {
      return NextResponse.json({ message: 'Today is Sunday. Skipping auto-absent job.' })
    }

    // 3. Check if today is a Holiday
    const { data: holiday } = await adminClient
      .from('holidays')
      .select('id, name')
      .eq('date', today)
      .maybeSingle()

    if (holiday) {
      return NextResponse.json({ message: `Today is a holiday (${holiday.name}). Skipping auto-absent job.` })
    }

    // 4. Read company settings for lock time
    const { data: settings, error: settingsError } = await adminClient
      .from('company_settings')
      .select('attendance_lock_time')
      .maybeSingle()

    if (settingsError || !settings?.attendance_lock_time) {
      console.error('[cron] Failed to read attendance_lock_time:', settingsError)
      return NextResponse.json({ error: 'Lock time settings not found' }, { status: 500 })
    }

    // 5. Compare current time with lock time
    const { hours, minutes } = getCurrentISTTime()
    const currentMinutes = hours * 60 + minutes
    const lockMinutes = timeToMinutes(settings.attendance_lock_time)

    // Ensure we only process if the current time is past the lock time
    // We give a 45-minute window for the cron to run to avoid running it multiple times excessively
    if (currentMinutes < lockMinutes || currentMinutes >= lockMinutes + 45) {
      return NextResponse.json({
        message: 'Not in the auto-absent execution window',
        currentIST: `${hours}:${String(minutes).padStart(2, '0')}`,
        lockTime: settings.attendance_lock_time,
      })
    }

    // 6. Fetch all active employees
    const { data: employees, error: empError } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'employee')

    if (empError || !employees) {
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    // 7. Fetch today's attendance records
    const { data: attendanceRecords, error: attError } = await adminClient
      .from('attendance')
      .select('employee_id')
      .eq('date', today)

    if (attError) {
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }

    const attendedEmployeeIds = new Set(attendanceRecords?.map((r) => r.employee_id) || [])

    // 8. Identify absent employees
    const absentEmployees = employees.filter((emp) => !attendedEmployeeIds.has(emp.id))

    if (absentEmployees.length === 0) {
      return NextResponse.json({ message: 'All employees have marked attendance today!' })
    }

    let markedAbsent = 0

    // 9. Process absent employees
    for (const emp of absentEmployees) {
      // Check if an 'absent' record already exists (just in case)
      const { data: existing } = await adminClient
        .from('attendance')
        .select('id')
        .eq('employee_id', emp.id)
        .eq('date', today)
        .maybeSingle()

      if (existing) continue // Should not happen due to Set check above, but safe

      const { error: insertError } = await adminClient
        .from('attendance')
        .insert({
          employee_id: emp.id,
          date: today,
          status: 'absent',
          late_reason: 'System generated: Attendance not marked by lock time.',
        })

      if (insertError) {
        console.error(`[cron] Failed to insert absent record for ${emp.id}:`, insertError)
        continue
      }

      markedAbsent++

      // Create in-app notification
      await createNotification({
        userId: emp.id,
        title: 'Marked Absent',
        message: `You have been automatically marked absent for today because attendance was not submitted by ${settings.attendance_lock_time}. If this is a mistake, please submit a correction request.`,
        type: 'reminder',
      })

      // Send email
      if (emp.email) {
        try {
          await sendNotificationEmail(
            emp.email,
            'You have been marked absent',
            'Automatic Absentee Alert',
            `Hi ${emp.full_name}, you have been automatically marked absent for today because your attendance was not recorded by ${settings.attendance_lock_time}. If you were present and simply forgot to check in, please submit an attendance correction request in the app.`
          )
        } catch (emailErr) {
          console.error(`[cron] Failed to send absent email to ${emp.email}:`, emailErr)
        }
      }
    }

    return NextResponse.json({
      message: `Successfully marked ${markedAbsent} employee(s) as absent.`,
      absentees: markedAbsent,
    })

  } catch (err) {
    console.error('[cron] Unexpected error in auto-absent:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
