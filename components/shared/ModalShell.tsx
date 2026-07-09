'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

export default function ModalShell({
  title,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: ModalShellProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`bg-white border border-[#E5E7EB] rounded-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] flex-shrink-0">
          <h2 id="modal-title" className="text-[15px] font-semibold text-[#111827]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-0.5 rounded"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
