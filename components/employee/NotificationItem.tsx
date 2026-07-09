import { Umbrella, Home, FileEdit, Bell } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Notification, NotificationType } from '@/types'

const ICON_CONFIG: Record<NotificationType, { icon: typeof Umbrella; bg: string; color: string }> = {
  leave:      { icon: Umbrella, bg: '#FFFBEB', color: '#D97706' },
  wfh:        { icon: Home,     bg: '#EFF6FF', color: '#2563EB' },
  correction: { icon: FileEdit, bg: '#FEF2F2', color: '#DC2626' },
  reminder:   { icon: Bell,     bg: '#FFFBEB', color: '#D97706' },
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface NotificationItemProps {
  notification: Notification
  onClick: (id: string) => void
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { icon: Icon, bg, color } = ICON_CONFIG[notification.type]

  return (
    <div
      onClick={() => onClick(notification.id)}
      className={cn(
        'bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 mb-2 flex items-start gap-3 cursor-pointer',
        'hover:bg-[#FAFAFA] transition-colors duration-150',
        !notification.is_read && 'border-l-2 border-l-[#4F46E5] rounded-l-none'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(notification.id) }}
      aria-label={notification.title}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}
        aria-hidden="true"
      >
        <Icon size={16} style={{ color }} strokeWidth={1.75} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] text-[#111827]',
          !notification.is_read ? 'font-medium' : 'font-normal'
        )}>
          {notification.title}
        </p>
        
        {(() => {
          const parts = notification.message.split('was not approved. ')
          if (parts.length > 1) {
            return (
              <div className="mt-1">
                <p className="text-[12px] text-[#6B7280] leading-relaxed">{parts[0]}was not approved.</p>
                <div className="mt-2 p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                  <p className="text-[11px] font-semibold text-[#DC2626]">Rejection Reason:</p>
                  <p className="text-[12px] text-[#991B1B] mt-0.5 leading-relaxed whitespace-pre-wrap">
                    {parts[1]}
                  </p>
                </div>
              </div>
            )
          }
          return <p className="text-[12px] text-[#6B7280] mt-0.5 leading-relaxed">{notification.message}</p>
        })()}
        <p className="text-[11px] text-[#9CA3AF] mt-1">{timeAgo(notification.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div
          className="w-2 h-2 bg-[#4F46E5] rounded-full flex-shrink-0 mt-1"
          aria-label="Unread"
        />
      )}
    </div>
  )
}
