'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

export default function AdminQRPage() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const origin = window.location.origin
    const token = process.env.NEXT_PUBLIC_QR_CHECKIN_TOKEN ?? ''
    
    if (!token) {
      setError('QR token not configured. Add NEXT_PUBLIC_QR_CHECKIN_TOKEN to environment variables.')
      setLoading(false)
      return
    }
    
    const url = `${origin}/qr-checkin?token=${token}`
    
    QRCode.toDataURL(
      url,
      {
        width: 280,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
      },
      (err, dataUrl) => {
        if (err) setError('Failed to generate QR code.')
        else setQrDataUrl(dataUrl)
        setLoading(false)
      }
    )
  }, [])

  function handleDownload() {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = 'office-qr-checkin.png'
    link.href = qrDataUrl
    link.click()
  }

  return (
    <div className="p-5 max-w-2xl">
      <PageHeader
        title="Office QR Code"
        subtitle="Display this QR in your office for employee check-in"
      />

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column — QR display */}
          <div className="flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
                <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] text-[#6B7280]">Generating...</p>
              </div>
            ) : error ? (
              <p className="text-[#DC2626] text-[13px]">{error}</p>
            ) : (
              <>
                <img src={qrDataUrl} alt="Office QR Code" className="rounded-lg" />
                <button
                  onClick={handleDownload}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2 text-[13px] font-medium transition-colors duration-150"
                >
                  <Download size={16} />
                  Download QR Code
                </button>
              </>
            )}
          </div>

          {/* Right column — instructions card */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 h-fit">
            <h3 className="text-[13px] font-semibold text-[#111827] mb-3">How to use</h3>
            <ol className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">1</div>
                <span className="text-[13px] text-[#374151]">Print or display this QR code in your office</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">2</div>
                <span className="text-[13px] text-[#374151]">Employees open the FeelifyEMS app on their phone</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">3</div>
                <span className="text-[13px] text-[#374151]">Tap 'Scan QR' in the sidebar</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">4</div>
                <span className="text-[13px] text-[#374151]">Scan the QR code — check-in screen opens instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">5</div>
                <span className="text-[13px] text-[#374151]">Select Office or WFH and confirm</span>
              </li>
            </ol>

            <div className="mt-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 text-[12px] text-[#D97706]">
              Keep this QR confidential. Anyone with this QR can mark attendance if they are within office radius.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
