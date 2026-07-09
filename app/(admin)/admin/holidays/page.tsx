'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarX } from 'lucide-react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import HolidayCard from '@/components/admin/HolidayCard'
import AddHolidayModal from '@/components/admin/AddHolidayModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/Toast'
import { getHolidays, createHoliday, deleteHoliday } from '@/lib/api/admin'
import type { Holiday } from '@/types'

function isUpcoming(date: string): boolean {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d >= today
}

export default function AdminHolidaysPage() {
  const { showToast } = useToast()
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null)

  useEffect(() => {
    getHolidays().then((data) => {
      setHolidays(data)
      setLoading(false)
    })
  }, [])

  // Sort: upcoming first, then past — both sorted by date
  const sorted = [...holidays].sort((a, b) => {
    const aUp = isUpcoming(a.date)
    const bUp = isUpcoming(b.date)
    if (aUp !== bUp) return aUp ? -1 : 1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const handleAdd = useCallback(async ({ name, date }: { name: string; date: string }) => {
    const res = await createHoliday({ name, date })
    if (res.error) {
      showToast(res.error, 'error')
      return
    }
    setHolidays((prev) => [...prev, res.data])
    showToast(`"${name}" added to holidays.`, 'success')
  }, [showToast])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    const res = await deleteHoliday(deleteTarget.id)
    if (res.error) {
      showToast(res.error, 'error')
      setDeleteTarget(null)
      return
    }
    setHolidays((prev) => prev.filter((h) => h.id !== deleteTarget.id))
    showToast(`"${deleteTarget.name}" removed.`, 'error')
    setDeleteTarget(null)
  }, [deleteTarget, showToast])

  const upcomingCount = holidays.filter((h) => isUpcoming(h.date)).length

  return (
    <>
      <AdminTopbar
        title="Holidays"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
          >
            + Add holiday
          </button>
        }
      />

      <main className="flex-1 p-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[76px] bg-[#F3F4F6] animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary */}
            {holidays.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-3 flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                  <span className="text-[12px] text-[#6B7280]">Upcoming:</span>
                  <span className="text-[12px] font-medium text-[#111827]">{upcomingCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                  <span className="text-[12px] text-[#6B7280]">Past:</span>
                  <span className="text-[12px] font-medium text-[#111827]">{holidays.length - upcomingCount}</span>
                </div>
                <span className="ml-auto text-[12px] text-[#9CA3AF]">{holidays.length} total</span>
              </div>
            )}

            {/* List */}
            {holidays.length === 0 ? (
              <EmptyState
                icon={CalendarX}
                heading="No holidays added"
                sub="Add company holidays to show them on all employee calendars."
                ctaLabel="Add holiday"
                onCta={() => setShowModal(true)}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {sorted.map((h) => (
                  <HolidayCard
                    key={h.id}
                    holiday={h}
                    onDelete={(id) => setDeleteTarget(holidays.find((x) => x.id === id) ?? null)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <AddHolidayModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove holiday?"
        message={`"${deleteTarget?.name}" will be removed from all employee calendars.`}
        confirmLabel="Remove"
        confirmDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
