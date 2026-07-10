import type { Metadata } from 'next'
import './globals.css'

import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('company_settings')
    .select('company_name, logo_url')
    .maybeSingle()

  return {
    title: settings?.company_name || 'Feelify EMS',
    description: 'Employee Attendance Management System',
    icons: settings?.logo_url ? { icon: settings.logo_url } : undefined,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
