import { createAdminClient } from '@/lib/supabase/admin'
import type { NotificationType } from '@/types'

export async function createNotification({
  userId,
  title,
  message,
  type,
}: {
  userId: string
  title: string
  message: string
  type: NotificationType
}): Promise<void> {
  try {
    const adminClient = createAdminClient()
    await adminClient.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
    })
  } catch (err) {
    console.error('[createNotification]', err)
  }
}
