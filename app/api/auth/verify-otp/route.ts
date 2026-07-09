import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp || otp.length !== 6) {
      return NextResponse.json(
        { data: null, error: 'Invalid request.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Read OTP from cookie
    const pendingCookie = request.cookies.get('_otp_pending')?.value
    if (!pendingCookie) {
      return NextResponse.json(
        { data: null, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    let otpData: { email: string; otp: string; expires: number }
    try {
      otpData = JSON.parse(Buffer.from(pendingCookie, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.json(
        { data: null, error: 'Invalid OTP session.' },
        { status: 400 }
      )
    }

    // Check expiry
    if (Date.now() > otpData.expires) {
      return NextResponse.json(
        { data: null, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check email + OTP match
    if (otpData.email !== normalizedEmail || otpData.otp !== otp) {
      return NextResponse.json(
        { data: null, error: 'Incorrect OTP. Please try again.' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Find (or create, on first login) the auth user for this email.
    const { data: authList, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError) {
      console.error('[verify-otp] listUsers failed', listError)
      return NextResponse.json(
        { data: null, error: 'Failed to create session.' },
        { status: 500 }
      )
    }

    let userId = authList.users.find((u) => u.email === normalizedEmail)?.id

    if (!userId) {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
      })
      if (createError || !newUser.user) {
        console.error('[verify-otp] createUser failed', createError)
        return NextResponse.json(
          { data: null, error: 'Failed to create session.' },
          { status: 500 }
        )
      }
      userId = newUser.user.id
    }

    // Mint a one-time magic-link token for this user, then immediately
    // redeem it server-side via verifyOtp — this is what actually issues
    // a real Supabase session (access + refresh token cookies), as opposed
    // to just checking the OTP matched.
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[verify-otp] generateLink failed', linkError)
      return NextResponse.json(
        { data: null, error: 'Failed to create session.' },
        { status: 500 }
      )
    }

    // Prepare a response object up front so the Supabase SSR client can
    // attach the real session cookies to it as it verifies the token.
    const response = NextResponse.json({ data: null, error: null })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: linkData.properties.hashed_token,
    })

    if (verifyError) {
      console.error('[verify-otp] verifyOtp failed', verifyError)
      return NextResponse.json(
        { data: null, error: 'Failed to create session.' },
        { status: 500 }
      )
    }

    // Get profile + role for the redirect decision
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('[verify-otp] profile fetch failed', profileError)
      return NextResponse.json(
        { data: null, error: 'Failed to retrieve profile.' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { data: null, error: 'Profile not found.' },
        { status: 404 }
      )
    }

    const role = profile.role ?? 'employee'

    response.cookies.delete('_otp_pending')

    // Re-serialize the JSON body now that we know the redirect target
    // (the session cookies set above are preserved on this same response).
    const finalBody = {
      data: { role, redirectTo: role === 'admin' ? '/admin/dashboard' : '/dashboard' },
      error: null,
    }
    return NextResponse.json(finalBody, { headers: response.headers })
  } catch (err) {
    console.error('[verify-otp]', err)
    return NextResponse.json(
      { data: null, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
