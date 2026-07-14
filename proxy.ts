import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/verify']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // Always allow public auth paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return response
  }

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return response
  }

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
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated — redirect to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'no_profile')
    return NextResponse.redirect(loginUrl)
  }

  // Inactive account
  if (profile?.status === 'inactive') {
    return NextResponse.redirect(new URL('/auth/login?error=inactive', request.url))
  }

  const role = profile?.role ?? 'employee'

  const EMPLOYEE_ONLY_PATHS = [
    '/dashboard',
    '/attendance',
    '/leave',
    '/wfh',
    '/correction',
    '/notifications',
    '/profile',
    '/scan',
    '/qr-checkin',
  ]

  if (EMPLOYEE_ONLY_PATHS.some((p) => pathname.startsWith(p)) && role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Employee trying to access admin routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
