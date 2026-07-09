'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const UnreadContext = createContext<number>(0)

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setUnread(json.data.filter((n: any) => !n.is_read).length)
        }
      })
      .catch(console.error)
  }, [pathname])

  return <UnreadContext.Provider value={unread}>{children}</UnreadContext.Provider>
}

export function useUnread() {
  return useContext(UnreadContext)
}
