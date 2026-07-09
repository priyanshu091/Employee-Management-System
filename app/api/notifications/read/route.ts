import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

    const { id, all } = await request.json()

    if (all) {
      const { error: mutationError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      if (mutationError) {
        console.error('[notifications] mutation failed:', mutationError)
        return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
      }
    } else if (id) {
      const { error: mutationError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)
      if (mutationError) {
        console.error('[notifications] mutation failed:', mutationError)
        return NextResponse.json({ data: null, error: mutationError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ data: { ok: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
