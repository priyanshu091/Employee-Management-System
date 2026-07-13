import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { rememberMe } = await request.json()

    if (typeof rememberMe !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    const allCookies = request.cookies.getAll()

    if (rememberMe) {
      // Extend maxAge to 30 days for Supabase auth cookies
      for (const cookie of allCookies) {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          response.cookies.set(cookie.name, cookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
          })
        }
      }

      response.cookies.set('sb-remember-me', 'true', {
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      })
    } else {
      // User explicitly rejected remember me (or it was false)
      // Keep them as session cookies, but update the preference flag
      response.cookies.set('sb-remember-me', 'false', {
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (err) {
    console.error('[extend-session]', err)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
