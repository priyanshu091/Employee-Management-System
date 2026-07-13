import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface QrValidateBody {
  token?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Always verify session first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const secret = process.env.QR_CHECKIN_SECRET
    if (!secret) {
      return NextResponse.json({ data: null, error: 'QR not configured' }, { status: 500 })
    }

    const body = (await request.json()) as QrValidateBody
    if (!body.token) {
      return NextResponse.json({ data: null, error: 'Token required' }, { status: 400 })
    }

    if (body.token !== secret) {
      return NextResponse.json({ data: null, error: 'Invalid QR code' }, { status: 400 })
    }

    return NextResponse.json({ data: { valid: true }, error: null }, { status: 200 })
  } catch (err) {
    console.error('[API Error]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
