'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmDanger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmDanger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-[15px] font-semibold text-[#111827]">{title}</h2>
        <p className="text-[13px] text-[#6B7280] mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg py-2 text-[13px] transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium text-white transition-colors duration-150 ${
              confirmDanger
                ? 'bg-[#DC2626] hover:bg-red-700'
                : 'bg-[#4F46E5] hover:bg-[#4338CA]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
