import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (caller?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${ext}`

    // Use service role to bypass storage RLS
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await adminSupabase.storage
      .from('company-assets')
      .upload(fileName, buffer, { upsert: true, contentType: file.type })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = adminSupabase.storage
      .from('company-assets')
      .getPublicUrl(fileName)

    // Update settings (we only have one row)
    const { error: updateError } = await supabase
      .from('company_settings')
      .update({ logo_url: publicUrl })
      .neq('id', '00000000-0000-0000-0000-000000000000') 

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ data: { publicUrl }, error: null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
