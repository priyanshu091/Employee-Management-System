'use client'

import { createContext, useContext, ReactNode } from 'react'
import useSWR from 'swr'
import { getMyNotifications } from '@/lib/api/employee'

const UnreadContext = createContext<number>(0)

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { data } = useSWR('myNotifications', getMyNotifications)
  const unread = data?.filter((n) => !n.is_read).length || 0

  return <UnreadContext.Provider value={unread}>{children}</UnreadContext.Provider>
}

export function useUnread() {
  return useContext(UnreadContext)
}
