'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import useSWR from 'swr'
import { getMyNotifications } from '@/lib/api/employee'
import { createClient } from '@/lib/supabase/client'

const UnreadContext = createContext<number>(0)

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { data, mutate } = useSWR('myNotifications', getMyNotifications)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (_payload) => {
          mutate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (_payload) => {
          mutate()
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Notification channel error — badge may be stale')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, mutate])

  const unread = data?.filter((n) => !n.is_read).length || 0

  return <UnreadContext.Provider value={unread}>{children}</UnreadContext.Provider>
}

export function useUnread() {
  return useContext(UnreadContext)
}
