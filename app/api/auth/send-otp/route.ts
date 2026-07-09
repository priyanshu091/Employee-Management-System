import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOTPEmail } from '@/lib/email/send-otp'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { data: null, error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const supabase = createAdminClient()

    // Check if email exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('email', normalizedEmail)
      .single()

    if (profileError || !profile) {
      // Return same message to prevent email enumeration
      return NextResponse.json(
        { data: null, error: 'No account found with this email address.' },
        { status: 404 }
      )
    }

    if (profile.status === 'inactive') {
      return NextResponse.json(
        { data: null, error: 'Your account has been deactivated. Contact your admin.' },
        { status: 403 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Send OTP via Resend email
    await sendOTPEmail(normalizedEmail, otp)

    // Store OTP + email in a short-lived, httpOnly cookie.
    // Only the OTP's presence is trusted client-side; verify-otp re-checks
    // expiry and match server-side before establishing any session.
    const otpData = JSON.stringify({
      email: normalizedEmail,
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    })
    const encoded = Buffer.from(otpData).toString('base64')

    const response = NextResponse.json({ data: { sent: true }, error: null })
    response.cookies.set('_otp_pending', encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json(
      { data: null, error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
}
