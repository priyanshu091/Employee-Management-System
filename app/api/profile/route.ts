import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EDITABLE_FIELDS = ['phone', 'emergency_contact', 'avatar_url'] as const
type EditableField = (typeof EDITABLE_FIELDS)[number]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const updates: Record<string, unknown> = await request.json()

    // Only allow employee-editable fields
    const safe: Partial<Record<EditableField, unknown>> = {}
    for (const key of EDITABLE_FIELDS) {
      if (key in updates) safe[key] = updates[key]
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
