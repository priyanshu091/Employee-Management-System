'use client'

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils/cn'

interface OTPInputProps {
  value: string[]
  onChange: (value: string[]) => void
  hasError: boolean
}

export default function OTPInput({ value, onChange, hasError }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    const newValue = [...value]
    newValue[index] = digit
    onChange(newValue)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const newValue = [...value]
        newValue[index] = ''
        onChange(newValue)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newValue = [...value]
        newValue[index - 1] = ''
        onChange(newValue)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newValue = [...value]
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newValue[i] = digit
    })
    onChange(newValue)
    const nextEmpty = newValue.findIndex((v) => !v)
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-11 h-13 text-center text-[18px] font-semibold rounded-lg border',
            'transition-colors duration-150 outline-none',
            'focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]',
            hasError
              ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
              : 'border-[#E5E7EB] bg-white text-[#111827]',
          )}
          style={{ width: '44px', height: '52px' }}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
