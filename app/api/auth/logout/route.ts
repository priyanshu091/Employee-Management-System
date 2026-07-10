import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const response = NextResponse.json(
      { data: 'logged out', error: null },
      { status: 200 }
    )

    // Clear the remember me cookie
    response.cookies.set('sb-remember-me', '', {
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[POST /api/auth/logout]', err)
    return NextResponse.json(
      { data: null, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
