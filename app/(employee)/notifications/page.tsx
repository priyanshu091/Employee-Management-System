'use client'

import useSWR from 'swr'
import { Bell } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'
import NotificationItem from '@/components/employee/NotificationItem'
import EmptyState from '@/components/shared/EmptyState'
import { getMyNotifications } from '@/lib/api/employee'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const { data, isLoading: loading, mutate } = useSWR('myNotifications', getMyNotifications)
  const notifications = data || []

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id: string) => {
    mutate(
      (prev = []) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n),
      false
    )
    await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const markAllRead = async () => {
    mutate((prev = []) => prev.map((n) => ({ ...n, is_read: true })), false)
    await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
  }

  return (
    <>
      <EmployeeTopbar title="Notifications" />

      <main className="flex-1 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#111827]">All notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-medium px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12px] text-[#4F46E5] hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        {!loading && notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            heading="No notifications yet"
            sub="Approvals and reminders will appear here."
          />
        ) : (
          <div>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={markAsRead}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
