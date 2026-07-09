'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface SessionState {
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
}

export function useSession(): SessionState {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data ?? null)
      setLoading(false)
    }

    fetchProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return {
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
  }
}
