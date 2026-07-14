import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmployeesClient from './ClientPage'

export const dynamic = 'force-dynamic'

export default async function AdminEmployeesPage() {
  const supabase = await createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial employees data on the server
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  return <EmployeesClient initialEmployees={profiles || []} />
}
