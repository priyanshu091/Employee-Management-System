import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role, id').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') return null
  return profile
}

export async function GET() {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { full_name, email, phone, department, designation, joining_date } = body

    if (!full_name?.trim() || !email?.trim() || !department || !designation?.trim() || !joining_date) {
      return NextResponse.json({ data: null, error: 'All required fields must be filled.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Generate next employee ID
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('employee_id')
      .order('created_at', { ascending: false })

    const maxNum = (profiles ?? []).reduce((max, row) => {
      const match = row.employee_id?.match(/^EMP-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        return num > max ? num : max
      }
      return max
    }, 0)

    const nextId = `EMP-${String(maxNum + 1).padStart(3, '0')}`

    // Create auth user
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      email_confirm: true,
    })

    if (authError || !authUser.user) {
      return NextResponse.json(
        { data: null, error: authError?.message ?? 'Failed to create user.' },
        { status: 500 }
      )
    }

    // Insert profile
    const { data, error } = await adminClient.from('profiles').insert({
      id: authUser.user.id,
      employee_id: nextId,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      department,
      designation: designation.trim(),
      joining_date,
      role: 'employee',
      status: 'active',
    }).select().single()

    if (error) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (err) {
    console.error('[employees POST]', err)
    return NextResponse.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
