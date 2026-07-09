'use client'

import { useState, useEffect } from 'react'
import { X, Building2, Home } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type WorkType = 'office' | 'wfh' | null

interface CheckInModalProps {
  onClose: () => void
  onCheckInSuccess: (type: 'office' | 'wfh') => void
}

export default function CheckInModal({ onClose, onCheckInSuccess }: CheckInModalProps) {
  const [selected, setSelected] = useState<WorkType>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleConfirm = () => {
    if (!selected) return
    onCheckInSuccess(selected)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
    >
      <div className="bg-white border border-[#E5E7EB] rounded-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
          <h2 id="checkin-modal-title" className="text-[15px] font-semibold text-[#111827]">
            Where are you working today?
          </h2>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Office option */}
            <button
              onClick={() => setSelected('office')}
              className={cn(
                'border rounded-xl p-4 text-center cursor-pointer transition-colors duration-150',
                selected === 'office'
                  ? 'border-[#4F46E5] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] hover:border-[#C7D2FE] hover:bg-[#F5F3FF]'
              )}
            >
              <Building2
                size={24}
                className={cn(
                  'mx-auto mb-2',
                  selected === 'office' ? 'text-[#4F46E5]' : 'text-[#6B7280]'
                )}
                strokeWidth={1.5}
              />
              <p className={cn('text-[13px] font-medium', selected === 'office' ? 'text-[#4F46E5]' : 'text-[#111827]')}>
                Office
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">GPS verified</p>
            </button>

            {/* WFH option */}
            <button
              onClick={() => setSelected('wfh')}
              className={cn(
                'border rounded-xl p-4 text-center cursor-pointer transition-colors duration-150',
                selected === 'wfh'
                  ? 'border-[#4F46E5] bg-[#EEF2FF]'
                  : 'border-[#E5E7EB] hover:border-[#C7D2FE] hover:bg-[#F5F3FF]'
              )}
            >
              <Home
                size={24}
                className={cn(
                  'mx-auto mb-2',
                  selected === 'wfh' ? 'text-[#4F46E5]' : 'text-[#6B7280]'
                )}
                strokeWidth={1.5}
              />
              <p className={cn('text-[13px] font-medium', selected === 'wfh' ? 'text-[#4F46E5]' : 'text-[#111827]')}>
                Work from home
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Request sent to admin</p>
            </button>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
