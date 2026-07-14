import { createAdminClient } from '@/lib/supabase/admin'

export async function writeAuditLog({
  targetType,
  targetId,
  employeeId,
  changedBy,
  previousValue,
  newValue,
  reason,
}: {
  targetType: string
  targetId: string
  employeeId: string
  changedBy: string
  previousValue: Record<string, unknown>
  newValue: Record<string, unknown>
  reason: string
}): Promise<void> {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('audit_logs').insert({
      target_type: targetType,
      target_id: targetId,
      employee_id: employeeId,
      changed_by: changedBy,
      previous_value: previousValue ?? {},
      new_value: newValue ?? {},
      reason,
    })

    if (error) {
      console.error('[AUDIT LOG FAILURE] Failed to write audit log:', error.message, {
        target_type: targetType,
        target_id: targetId,
      })
    }
  } catch (err) {
    console.error('[writeAuditLog]', err)
  }
}
