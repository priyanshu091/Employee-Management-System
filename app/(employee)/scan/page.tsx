'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode, Html5QrcodeResult, Html5QrcodeScannerState } from 'html5-qrcode'
import { QrCode, AlertCircle } from 'lucide-react'
import EmployeeTopbar from '@/components/employee/EmployeeTopbar'

export default function ScanPage() {
  const router = useRouter()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    const scannerId = 'qr-scanner-container'
    const scanner = new Html5Qrcode(scannerId)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string, result: Html5QrcodeResult) => {
        // On successful scan
        handleScanSuccess(decodedText)
      },
      () => {
        // Scan attempt failed — ignore, keep scanning
      }
    )
    .then(() => {
      setScanning(true)
      setHasPermission(true)
    })
    .catch((err: unknown) => {
      setHasPermission(false)
      if (err instanceof Error) {
        setError(err.message.includes('permission')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Could not start camera. Please try again.')
      } else {
        setError('Could not start camera. Please try again.')
      }
    })

    return () => {
      // Cleanup: stop camera on unmount
      scanner.getState() !== Html5QrcodeScannerState.NOT_STARTED &&
        scanner.stop().catch((err) => {
          console.error('[QR Scanner] Cleanup stop failed:', err)
        })
    }
  }, [])

  async function handleScanSuccess(decodedText: string) {
    try {
      // Fire-and-forget stop camera so it doesn't block router.push on slow devices
      scannerRef.current?.stop().catch((err) => {
        console.error('[QR Scanner] Failed to stop camera:', err)
      })
    } catch (err) {
      console.error('[QR Scanner] Sync error stopping camera:', err)
    }

    // Validate it looks like our QR URL
    try {
      const url = new URL(decodedText)
      const token = url.searchParams.get('token')
      if (!token) {
        setError('Invalid QR code. Please scan the office QR code.')
        return
      }
      // Navigate to qr-checkin with the token
      router.push(`/qr-checkin?token=${encodeURIComponent(token)}`)
    } catch {
      setError('Invalid QR code. Please scan the office QR code.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <EmployeeTopbar title="Scan Office QR" />

      <div className="px-4 pt-6 max-w-sm mx-auto">
        {scanning && (
          <p className="text-center text-[13px] text-[#6B7280] mb-4">
            Point your camera at the office QR code
          </p>
        )}

        <div
          id="qr-scanner-container"
          className="w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-black"
          style={{ minHeight: '300px' }}
        />

        {(hasPermission === false || error) && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mt-4 flex items-start gap-3">
            <AlertCircle size={20} color="#DC2626" className="flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-[#111827]">Camera Error</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 border border-[#E5E7EB] text-[#374151] rounded-lg px-4 py-1.5 text-[12px] font-medium transition-colors hover:bg-[#F9FAFB]"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {scanning && !error && (
          <p className="mt-4 text-center text-[12px] text-[#9CA3AF]">
            Make sure the QR code is well-lit and fully visible
          </p>
        )}
      </div>
    </div>
  )
}
