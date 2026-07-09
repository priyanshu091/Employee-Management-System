import { cn } from '@/lib/utils/cn'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}

export default function FormField({
  label,
  required,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[12px] text-[#DC2626]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Shared input class string — import and use in modal inputs
export const INPUT_CLASS = `
  w-full border border-[#E5E7EB] rounded-md px-3 py-2.5 text-[13px] text-[#111827]
  placeholder:text-[#9CA3AF] bg-white outline-none
  focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]
  transition-colors duration-150
  disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed
`

export const INPUT_ERROR_CLASS = `
  border-[#DC2626] bg-[#FEF2F2]
  focus:border-[#DC2626] focus:ring-[#DC2626]
`
